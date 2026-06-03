from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel
from sqlmodel import Session, select

import os
from database import get_session
from models import User, RunLog

SECRET_KEY = os.getenv("SECRET_KEY", "pinkfit-super-secret-key-for-local-dev-12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day for convenience


router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    email: str
    password: str
    gender: str = "female"
    weight_kg: float = 50.0

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    gender: str
    weight_kg: float
    height: Optional[int] = None
    injury_history: Optional[str] = "None"
    target_protein_rest: float
    target_protein_training: float
    target_protein_today: float = 60.0
    is_training_day: bool = False
    strava_athlete_id: Optional[int] = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    height: Optional[int] = None
    weight_kg: Optional[float] = None
    gender: Optional[str] = None
    injury_history: Optional[str] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    # Check if user already exists
    statement = select(User).where(User.email == user_in.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_in.password)
    
    # Calculate protein targets based on gender and weight_kg
    if user_in.gender == "female":
        target_rest = user_in.weight_kg * 1.0
        target_training = user_in.weight_kg * 1.4
    else:
        target_rest = user_in.weight_kg * 1.2
        target_training = user_in.weight_kg * 1.5

    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role="user",
        gender=user_in.gender,
        weight_kg=user_in.weight_kg,
        target_protein_rest=target_rest,
        target_protein_training=target_training
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    res = UserResponse.from_orm(db_user)
    res.target_protein_today = db_user.target_protein_rest
    res.is_training_day = False
    return res

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    stmt = select(RunLog).where((RunLog.user_id == current_user.id) & (RunLog.date == today_str))
    has_run = session.exec(stmt).first() is not None
    
    target_today = current_user.target_protein_training if has_run else current_user.target_protein_rest
    
    res = UserResponse.from_orm(current_user)
    res.target_protein_today = target_today
    res.is_training_day = has_run
    return res

@router.put("/profile", response_model=UserResponse)
def update_profile(profile_in: ProfileUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if profile_in.height is not None:
        current_user.height = profile_in.height
    if profile_in.weight_kg is not None:
        current_user.weight_kg = profile_in.weight_kg
    if profile_in.gender is not None:
        current_user.gender = profile_in.gender
    if profile_in.injury_history is not None:
        current_user.injury_history = profile_in.injury_history
        
    # Recalculate protein targets based on updated gender and weight_kg
    if current_user.gender == "female":
        current_user.target_protein_rest = current_user.weight_kg * 1.0
        current_user.target_protein_training = current_user.weight_kg * 1.4
    else:
        current_user.target_protein_rest = current_user.weight_kg * 1.2
        current_user.target_protein_training = current_user.weight_kg * 1.5
        
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    stmt = select(RunLog).where((RunLog.user_id == current_user.id) & (RunLog.date == today_str))
    has_run = session.exec(stmt).first() is not None
    
    target_today = current_user.target_protein_training if has_run else current_user.target_protein_rest
    
    res = UserResponse.from_orm(current_user)
    res.target_protein_today = target_today
    res.is_training_day = has_run
    return res
