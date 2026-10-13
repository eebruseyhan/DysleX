from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserPreference
from app.schemas import Token, UserCreate, UserLogin, UserOut
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _authenticate(db: Session, identifier: str, password: str) -> User:
    user = (
        db.query(User)
        .filter(or_(User.username == identifier, User.email == identifier.lower()))
        .first()
    )
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı/e-posta veya şifre hatalı",
        )
    return user


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    email = data.email.lower()
    exists = (
        db.query(User)
        .filter(or_(User.username == data.username, User.email == email))
        .first()
    )
    if exists:
        field = "Kullanıcı adı" if exists.username == data.username else "E-posta"
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"{field} zaten kullanılıyor")

    user = User(
        username=data.username,
        email=email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.flush()
    # Yeni kullanıcı için varsayılan okuma tercihleri
    db.add(UserPreference(user_id=user.id))
    db.commit()
    db.refresh(user)

    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = _authenticate(db, data.username_or_email, data.password)
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/token", response_model=Token, include_in_schema=False)
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Swagger UI 'Authorize' butonu için OAuth2 form tabanlı giriş."""
    user = _authenticate(db, form.username, form.password)
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
