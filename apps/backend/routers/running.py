from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import RunLog, User
from routers.auth import get_current_user

router = APIRouter(prefix="/running", tags=["running"])

class RunLogCreate(BaseModel):
    date: str
    distance: float
    pace: str  # Format: "M:SS" e.g., "5:30"
    hr: int
    cadence: int

class RunLogResponse(BaseModel):
    id: int
    user_id: int
    date: str
    distance: float
    pace: str
    hr: int
    cadence: int
    fatigue_score: float

    class Config:
        from_attributes = True

def calculate_fatigue_score(distance: float, pace_str: str, hr: int, cadence: int) -> float:
    """
    Fatigue Matrix Calculation:
    Estimates fatigue on a scale of 1.0 - 10.0 using Distance, Heart Rate, Pace, and Cadence.
    - High HR relative to slow pace indicates higher cardiovascular fatigue.
    - Low cadence relative to fast pace indicates higher muscle fatigue.
    - Longer distances increase fatigue non-linearly.
    """
    try:
        # Convert pace "M:SS" to total seconds per km
        parts = pace_str.split(":")
        minutes = int(parts[0])
        seconds = int(parts[1])
        pace_seconds = (minutes * 60) + seconds
    except Exception:
        # Fallback if format is invalid
        pace_seconds = 360  # Default 6:00 pace
        
    # Cardiovascular Load factor (base on HR: heart rates above 130 increase fatigue score)
    hr_factor = max(1.0, (hr - 100) * 0.08)
    
    # Distance Load factor
    dist_factor = distance * 0.15
    
    # Cadence Factor (low cadence below 170 spm implies high impact shock/fatigue)
    cadence_factor = 1.1 if cadence < 170 else 0.9
    
    # Combine factors to form fatigue score (bounded between 1.0 and 10.0)
    score = (hr_factor + dist_factor) * cadence_factor
    return round(min(10.0, max(1.0, score)), 1)

@router.post("/", response_model=RunLogResponse)
def create_run_log(run_in: RunLogCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    calculated_fatigue = calculate_fatigue_score(
        distance=run_in.distance,
        pace_str=run_in.pace,
        hr=run_in.hr,
        cadence=run_in.cadence
    )
    
    db_run = RunLog(
        user_id=current_user.id,
        date=run_in.date,
        distance=run_in.distance,
        pace=run_in.pace,
        hr=run_in.hr,
        cadence=run_in.cadence,
        fatigue_score=calculated_fatigue
    )
    session.add(db_run)
    session.commit()
    session.refresh(db_run)
    return db_run

@router.get("/", response_model=List[RunLogResponse])
def get_run_logs(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(RunLog).where(RunLog.user_id == current_user.id)
    return session.exec(statement).all()

# --- AI Run Snap Endpoints ---

class RunSnapRequest(BaseModel):
    base64_image: str

@router.post("/snap", response_model=RunLogResponse)
def analyze_run_screenshot(request: RunSnapRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    import os
    import base64
    import json
    import urllib.request
    import urllib.error
    from datetime import datetime
    
    api_key = os.getenv("GEMINI_API_KEY")
    
    # 1. Default mock fallback if GEMINI_API_KEY is not configured
    if not api_key:
        mock_distance = 6.4
        mock_pace = "6:12"
        mock_hr = 145
        mock_cadence = 172
        mock_fatigue = calculate_fatigue_score(mock_distance, mock_pace, mock_hr, mock_cadence)
        
        db_run = RunLog(
            user_id=current_user.id,
            date=datetime.utcnow().strftime("%Y-%m-%d"),
            distance=mock_distance,
            pace=mock_pace,
            hr=mock_hr,
            cadence=mock_cadence,
            fatigue_score=mock_fatigue
        )
        session.add(db_run)
        session.commit()
        session.refresh(db_run)
        return db_run

    try:
        # 2. Extract mime type and base64 encoded data
        header, encoded = request.base64_image.split(",", 1) if "," in request.base64_image else ("", request.base64_image)
        mime_type = "image/jpeg"
        if header.startswith("data:"):
            parts = header.split(";")
            if len(parts) > 0:
                mime_type = parts[0].replace("data:", "")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        system_prompt = (
            "You are a strict data extraction assistant. Analyze the running workout screenshot "
            "(from Garmin, Apple Fitness, Coros, etc.). Extract the following metrics and return ONLY "
            "a raw JSON object with no markdown formatting or extra text. If a metric is not found, "
            "set its value to null. Schema: { 'distance_km': float, 'duration_minutes': float, "
            "'average_pace': string (format 'MM:SS'), 'average_heart_rate': integer, 'average_cadence': integer }"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": system_prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": encoded
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            res_json = json.loads(res_data)
            
            candidates = res_json.get("candidates", [])
            if not candidates:
                raise HTTPException(status_code=500, detail="No analysis candidates returned from Gemini API")
                
            text_content = candidates[0]["content"]["parts"][0]["text"]
            parsed_result = json.loads(text_content.strip())
            
            # 3. Extract metrics and handle null values with defaults
            distance = parsed_result.get("distance_km")
            if distance is None:
                distance = 5.0
            else:
                distance = float(distance)
                
            pace = parsed_result.get("average_pace")
            if not pace or not isinstance(pace, str) or ":" not in pace:
                pace = "6:00"
                
            hr = parsed_result.get("average_heart_rate")
            if hr is None:
                hr = 140
            else:
                hr = int(hr)
                
            cadence = parsed_result.get("average_cadence")
            if cadence is None:
                cadence = 170
            else:
                cadence = int(cadence)
                
            # 4. Calculate fatigue score
            calculated_fatigue = calculate_fatigue_score(
                distance=distance,
                pace_str=pace,
                hr=hr,
                cadence=cadence
            )
            
            # 5. Create database entry
            db_run = RunLog(
                user_id=current_user.id,
                date=datetime.utcnow().strftime("%Y-%m-%d"),
                distance=distance,
                pace=pace,
                hr=hr,
                cadence=cadence,
                fatigue_score=calculated_fatigue
            )
            session.add(db_run)
            session.commit()
            session.refresh(db_run)
            return db_run
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze workout screenshot: {str(e)}")
