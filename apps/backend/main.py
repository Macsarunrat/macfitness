import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# Resolve absolute path to .env file relative to main.py
env_path = find_dotenv()

# 2. เพิ่ม override=True เพื่อบังคับให้โหลดค่าทับตัวแปรระบบเดิมที่อาจค้างอยู่
load_dotenv(env_path, override=True)

# 3. Debug เช็คความชัวร์ (ลบบรรทัดนี้ทิ้งได้เมื่อระบบใช้งานได้ปกติ)
print(f"[INFO] System is loading .env from: {env_path or 'NOT FOUND!'}")
print(f"[INFO] Gemini API Key status: {'LOADED' if os.getenv('GEMINI_API_KEY') else 'MISSING'}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables
from routers import auth, nutrition, running, social

app = FastAPI(
    title="PinkFit API - Couple Fitness & Nutrition Tracker",
    description="Backend API with JWT Auth, Gemini AI Nutrition Parsing, Running Fatigue Calculation, and Couple Progress Sharing.",
    version="1.0.0"
)

# CORS Configuration
# Adjust to allow Vercel origins and local Vite server port (usually 5173)
# CORS Configuration
# Adjust to allow Vercel origins and local Vite server port (usually 5173)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://macfitness.vercel.app",  # เปลี่ยนเป็น URL จริงของคุณตี๋
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # เติม |https://.*.vercel.app ต่อท้ายของเดิม เพื่อให้รองรับทุกลิงก์ของ Vercel
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?|https?://.*\.ngrok-free\.app|https://.*.vercel.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB tables setup
@app.on_event("startup")
def on_startup():
    try:
        create_db_and_tables()
        print("[DATABASE] Tables created or verified successfully.")
    except Exception as e:
        print("[DATABASE][CRITICAL] Failed to connect or initialize PostgreSQL database!")
        print(f"[DATABASE][ERROR_DETAIL] {str(e)}")
        raise e

# Include API module routers
app.include_router(auth.router)
app.include_router(nutrition.router)
app.include_router(running.router)
app.include_router(social.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "PinkFit Backend API",
        "description": "Healthy and cute tracker for sweet couples!"
    }
