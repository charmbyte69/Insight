from sqlalchemy.orm import Session
from .model import User
from .schema import RegisterRequest
from app.security import hash_password, verify_password


def create_user(db: Session, user: RegisterRequest):
    # Check if instructor_id already exists
    existing = db.query(User).filter(User.instructor_id == user.instructor_id).first()
    if existing:
        raise ValueError("Instructor ID already registered")

    db_user = User(
        instructor_id=user.instructor_id,
        name=user.name,
        password=hash_password(user.password)
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(db: Session, instructor_id: str, password: str):

    user = db.query(User).filter(User.instructor_id == instructor_id).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user