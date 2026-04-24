from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    UpdateUsernameRequest,
)
from app.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.asc()).all()


@router.patch("/me/username", response_model=UserResponse)
def update_username(
    payload: UpdateUsernameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    username = payload.username.strip()

    if len(username) < 3:
        raise HTTPException(
            status_code=400,
            detail="Kullanici adi en az 3 karakter olmali",
        )

    current_user.username = username
    db.commit()
    db.refresh(current_user)

    return current_user

@router.post("/register")
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email zaten var")

    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Kayıt başarılı"}

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Hatalı giriş")

    token = create_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }
