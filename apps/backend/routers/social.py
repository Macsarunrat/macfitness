import random
import string
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import Group, GroupMember, User, NutritionLog, RunLog
from routers.auth import get_current_user, UserResponse

router = APIRouter(prefix="/social", tags=["social"])

class GroupCreate(BaseModel):
    name: str

class GroupJoin(BaseModel):
    invite_code: str

class GroupResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    creator_id: int

    class Config:
        from_attributes = True

class MemberProgressResponse(BaseModel):
    user_id: int
    name: str
    email: str
    height: Optional[int]
    weight_kg: float
    gender: str
    injury_history: Optional[str]
    target_protein_rest: float
    target_protein_training: float
    target_protein_today: float
    is_training_day: bool
    today_protein: int
    today_calories: int
    last_run_distance: Optional[float] = None
    last_run_date: Optional[str] = None

class GroupProgressResponse(BaseModel):
    group_info: GroupResponse
    members: List[MemberProgressResponse]

def generate_invite_code() -> str:
    # Generates a code like "CUTE-732" or "PINK-943"
    prefixes = ["CUTE", "PINK", "SOFT", "FIT", "SQUAD", "ACTIVE"]
    random_prefix = random.choice(prefixes)
    random_nums = "".join(random.choices(string.digits, k=3))
    return f"{random_prefix}-{random_nums}"

@router.post("/group/create", response_model=GroupResponse)
def create_new_group(req: GroupCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Check if user is already in a group
    stmt = select(GroupMember).where(GroupMember.user_id == current_user.id)
    existing_membership = session.exec(stmt).first()
    if existing_membership:
        raise HTTPException(
            status_code=400,
            detail="You are already in a fitness squad. Leave your current squad first."
        )

    # Generate a unique invite code
    unique_code = None
    for _ in range(5):
        code_cand = generate_invite_code()
        stmt_code = select(Group).where(Group.invite_code == code_cand)
        if not session.exec(stmt_code).first():
            unique_code = code_cand
            break
    if not unique_code:
        unique_code = f"FIT-{random.randint(100, 999)}"

    # Create Group
    db_group = Group(
        name=req.name,
        invite_code=unique_code,
        creator_id=current_user.id
    )
    session.add(db_group)
    session.commit()
    session.refresh(db_group)

    # Add creator as the first member
    db_member = GroupMember(
        group_id=db_group.id,
        user_id=current_user.id
    )
    session.add(db_member)
    session.commit()

    return db_group

@router.post("/group/join", response_model=GroupResponse)
def join_group_by_code(req: GroupJoin, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Check if user is already in a group
    stmt_member = select(GroupMember).where(GroupMember.user_id == current_user.id)
    existing_membership = session.exec(stmt_member).first()
    if existing_membership:
        raise HTTPException(
            status_code=400,
            detail="You are already in a fitness squad. Leave your current squad first."
        )

    # Find the group
    stmt_group = select(Group).where(Group.invite_code == req.invite_code.upper())
    group = session.exec(stmt_group).first()
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    # Add user to GroupMember
    db_member = GroupMember(
        group_id=group.id,
        user_id=current_user.id
    )
    session.add(db_member)
    session.commit()

    return group

@router.get("/group/members", response_model=GroupProgressResponse)
def get_squad_members_progress(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Find group membership
    stmt_member = select(GroupMember).where(GroupMember.user_id == current_user.id)
    membership = session.exec(stmt_member).first()
    if not membership:
        raise HTTPException(status_code=404, detail="You are not part of any fitness squad")

    # Find Group info
    group = session.get(Group, membership.group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Find all members in group
    stmt_all_members = select(GroupMember).where(GroupMember.group_id == group.id)
    all_members = session.exec(stmt_all_members).all()
    
    member_ids = [mb.user_id for mb in all_members]
    if not member_ids:
        return GroupProgressResponse(
            group_info=GroupResponse.from_orm(group),
            members=[]
        )
    
    # 1. Fetch all users in one batch query
    stmt_users = select(User).where(User.id.in_(member_ids))
    users = session.exec(stmt_users).all()
    user_map = {u.id: u for u in users}
    
    # 2. Fetch all daily nutrition logs in one batch query
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    stmt_food = select(NutritionLog).where(
        (NutritionLog.user_id.in_(member_ids)) & 
        (NutritionLog.date == today_str)
    )
    all_foods = session.exec(stmt_food).all()
    
    food_map = {}
    for f in all_foods:
        if f.user_id not in food_map:
            food_map[f.user_id] = {"protein": 0, "calories": 0}
        food_map[f.user_id]["protein"] += f.protein_amount
        food_map[f.user_id]["calories"] += f.calories

    # 3. Fetch all running logs to filter/group latest runs per user in memory
    stmt_runs = select(RunLog).where(RunLog.user_id.in_(member_ids))
    all_runs = session.exec(stmt_runs).all()
    
    run_map = {}
    for r in all_runs:
        current_latest = run_map.get(r.user_id)
        if not current_latest or r.date > current_latest.date:
            run_map[r.user_id] = r

    members_progress = []
    for uid in member_ids:
        user = user_map.get(uid)
        if not user:
            continue
        
        user_food = food_map.get(uid, {"protein": 0, "calories": 0})
        last_run = run_map.get(uid)
        
        # Check if they ran today
        ran_today = any(r.user_id == uid and r.date == today_str for r in all_runs)
        target_today = user.target_protein_training if ran_today else user.target_protein_rest

        members_progress.append(
            MemberProgressResponse(
                user_id=user.id,
                name=user.email.split("@")[0].capitalize(),
                email=user.email,
                height=user.height,
                weight_kg=user.weight_kg,
                gender=user.gender,
                injury_history=user.injury_history,
                target_protein_rest=user.target_protein_rest,
                target_protein_training=user.target_protein_training,
                target_protein_today=target_today,
                is_training_day=ran_today,
                today_protein=user_food["protein"],
                today_calories=user_food["calories"],
                last_run_distance=last_run.distance if last_run else None,
                last_run_date=last_run.date if last_run else None
            )
        )

    return GroupProgressResponse(
        group_info=GroupResponse.from_orm(group),
        members=members_progress
    )

@router.post("/group/leave")
def leave_current_group(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    stmt = select(GroupMember).where(GroupMember.user_id == current_user.id)
    membership = session.exec(stmt).first()
    if not membership:
        raise HTTPException(status_code=404, detail="You are not part of any fitness squad")

    session.delete(membership)
    session.commit()
    
    # If group is empty, delete group too
    stmt_leftover = select(GroupMember).where(GroupMember.group_id == membership.group_id)
    leftover = session.exec(stmt_leftover).first()
    if not leftover:
        group = session.get(Group, membership.group_id)
        if group:
            session.delete(group)
            session.commit()

    return {"status": "success", "message": "Successfully left the squad"}
