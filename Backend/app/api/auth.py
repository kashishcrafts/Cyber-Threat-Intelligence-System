from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.login import LoginRequest
from app.services.auth import verify_password
from app.services.jwt_handler import create_access_token

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.auth import hash_password

router = APIRouter()


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_user:
        return {
            "message": "Username already exists"
        }

    new_user = User(
        username=user.username,
        password=hash_password(
            user.password
        )
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "User registered successfully"
    }

@router.post("/login")
def login_user(
    user: LoginRequest,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if not existing_user:
        return {
            "message": "Invalid username or password"
        }

    if not verify_password(
        user.password,
        existing_user.password
    ):
        return {
            "message": "Invalid username or password"
        }

    access_token = create_access_token(
        {
            "sub": existing_user.username
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }