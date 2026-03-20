from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from . import service, schema
from app.database import get_db
from app.security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/register")
def register(user: schema.RegisterRequest, db: Session = Depends(get_db)):

    try:
        created_user = service.create_user(db, user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": f"Instructor {created_user.instructor_id} registered successfully"}

@router.post("/login", response_model=schema.TokenResponse)
def login(data: schema.LoginRequest, db: Session = Depends(get_db)):

    user = service.authenticate_user(db, data.instructor_id, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(
        {"user_id": user.id}
    )

    return {
        "Welcome_user": user.name,
        "access_token": token
        }