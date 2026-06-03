import os
import base64
import json
import urllib.request
import urllib.error
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import NutritionLog, User
from routers.auth import get_current_user

router = APIRouter(prefix="/nutrition", tags=["nutrition"])

class NutritionCreate(BaseModel):
    date: str
    food_name: str
    protein_amount: int
    calories: int
    image_url: Optional[str] = None

class NutritionResponse(BaseModel):
    id: int
    user_id: int
    date: str
    food_name: str
    protein_amount: int
    calories: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class ImageAnalysisRequest(BaseModel):
    base64_image: str  # Base64 string of the image

class ImageAnalysisResponse(BaseModel):
    foodName: str
    calories: int
    proteinAmount: int
    confidence: float
    remarks: str

class TextEstimateRequest(BaseModel):
    food_name: str

class TextEstimateResponse(BaseModel):
    calories: int
    proteinAmount: int
    remarks: str

@router.post("/", response_model=NutritionResponse)
def create_nutrition_log(log_in: NutritionCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_log = NutritionLog(
        user_id=current_user.id,
        date=log_in.date,
        food_name=log_in.food_name,
        protein_amount=log_in.protein_amount,
        calories=log_in.calories,
        image_url=log_in.image_url
    )
    session.add(db_log)
    session.commit()
    session.refresh(db_log)
    return db_log

@router.get("/", response_model=List[NutritionResponse])
def get_nutrition_logs(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(NutritionLog).where(NutritionLog.user_id == current_user.id)
    return session.exec(statement).all()

@router.post("/analyze-image", response_model=ImageAnalysisResponse)
def analyze_food_image(request: ImageAnalysisRequest, current_user: User = Depends(get_current_user)):
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        return ImageAnalysisResponse(
            foodName="สลัดแซลมอนอะโวคาโดไข่ต้ม 🥗",
            calories=380,
            proteinAmount=22,
            confidence=0.95,
            remarks="⚠️ ตรวจไม่พบ GEMINI_API_KEY ในระบบหลังบ้านของคุณ (กำลังทดสอบในโหมดจำลอง) กรุณาสร้างคีย์ฟรีใน Google AI Studio และนำมาใส่ในไฟล์ .env ท้องถิ่นเพื่อเชื่อมต่อระบบวิเคราะห์จริงนะคะ"
        )

    try:
        header, encoded = request.base64_image.split(",", 1) if "," in request.base64_image else ("", request.base64_image)
        mime_type = "image/jpeg"
        if header.startswith("data:"):
            parts = header.split(";")
            if len(parts) > 0:
                mime_type = parts[0].replace("data:", "")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        prompt = (
            "Identify the food in the image. Return a JSON object with the following fields: "
            "'foodName' (string, name in Thai with a cute emoji), "
            "'calories' (integer, estimated total calories), "
            "'proteinAmount' (integer, estimated protein in grams), "
            "'confidence' (float between 0.0 and 1.0 representing how confident you are), "
            "'remarks' (string, brief health/nutrition advice in Thai)."
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
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
            
            return ImageAnalysisResponse(
                foodName=parsed_result.get("foodName", "อาหารเพื่อสุขภาพ 🥗"),
                calories=int(parsed_result.get("calories", 0)),
                proteinAmount=int(parsed_result.get("proteinAmount", 0)),
                confidence=float(parsed_result.get("confidence", 0.0)),
                remarks=parsed_result.get("remarks", "ไม่มีคำแนะนำเพิ่มเติม")
            )
    except urllib.error.HTTPError as he:
        err_msg = he.read().decode("utf-8")
        raise HTTPException(status_code=500, detail=f"Gemini API returned error: {err_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze food image: {str(e)}")

@router.post("/estimate-text", response_model=TextEstimateResponse)
def estimate_nutrition_from_text(req: TextEstimateRequest, current_user: User = Depends(get_current_user)):
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Smart local heuristics fallback
    name_lower = req.food_name.lower()
    est_calories = 350
    est_protein = 15
    est_remarks = "ประมาณการโภชนาการจำลองด้วยระบบค้นหาคีย์เวิร์ดท้องถิ่น"
    
    if "อกไก่" in name_lower or "ไก่" in name_lower:
        est_protein = 28
        est_calories = 250
    elif "ไข่" in name_lower:
        est_protein = 12
        est_calories = 180
    elif "แซลมอน" in name_lower or "ปลา" in name_lower:
        est_protein = 24
        est_calories = 300
    elif "สลัด" in name_lower:
        est_protein = 8
        est_calories = 150
    elif "หมู" in name_lower or "เนื้อ" in name_lower:
        est_protein = 22
        est_calories = 450
    elif "เวย์" in name_lower or "โปรตีน" in name_lower:
        est_protein = 30
        est_calories = 140
        
    if not api_key:
        return TextEstimateResponse(
            calories=est_calories,
            proteinAmount=est_protein,
            remarks=f"⚠️ ตรวจไม่พบคีย์ API หลังบ้าน {est_remarks}"
        )

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        prompt = (
            f"Estimate calories and protein amount for this dish: '{req.food_name}'. "
            "Return a JSON object with the following fields: "
            "'calories' (integer, estimated total calories), "
            "'proteinAmount' (integer, estimated protein in grams), "
            "'remarks' (string, brief health/nutrition advice in Thai)."
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
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
            if candidates:
                text_content = candidates[0]["content"]["parts"][0]["text"]
                parsed_result = json.loads(text_content.strip())
                return TextEstimateResponse(
                    calories=int(parsed_result.get("calories", est_calories)),
                    proteinAmount=int(parsed_result.get("proteinAmount", est_protein)),
                    remarks=parsed_result.get("remarks", "วิเคราะห์ด้วยหลักโภชนาการจำลอง")
                )
    except Exception:
        pass
        
    return TextEstimateResponse(
        calories=est_calories,
        proteinAmount=est_protein,
        remarks=f"{est_remarks} (Fallback)"
    )
