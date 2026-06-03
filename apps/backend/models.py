from typing import Optional
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = "user"
    gender: str = Field(default="female")  # "male" or "female"
    weight_kg: float = Field(default=50.0)
    height: Optional[int] = None
    injury_history: Optional[str] = "None"
    target_protein_rest: float = Field(default=60.0)
    target_protein_training: float = Field(default=80.0)
    
    # Strava Integration Fields
    strava_athlete_id: Optional[int] = Field(default=None, nullable=True)
    strava_access_token: Optional[str] = Field(default=None, nullable=True)
    strava_refresh_token: Optional[str] = Field(default=None, nullable=True)
    strava_expires_at: Optional[int] = Field(default=None, nullable=True)

class RunLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    date: str
    distance: float
    pace: str
    hr: int
    cadence: int
    fatigue_score: float

class NutritionLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    date: str
    image_url: Optional[str] = None
    food_name: str
    protein_amount: int
    calories: int

class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    invite_code: str = Field(unique=True, index=True)
    creator_id: int = Field(foreign_key="user.id")

class GroupMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="group.id")
    user_id: int = Field(foreign_key="user.id")

