from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Auth / User ----------
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    # Kullanıcı adı veya e-posta ile giriş yapılabilir
    username_or_email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    role: Optional[str] = None
    created_at: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Documents ----------
class DocumentListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: Optional[datetime] = None


class DocumentOut(DocumentListItem):
    extracted_text: Optional[str] = None


class DocumentUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)


# ---------- Preferences ----------
class PreferenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    font_family: str
    font_size: int
    background_color: str
    line_height: float
    bionic_reading_enabled: bool
    updated_at: Optional[datetime] = None


class PreferenceUpdate(BaseModel):
    font_family: Optional[str] = Field(default=None, max_length=50)
    font_size: Optional[int] = Field(default=None, ge=10, le=48)
    background_color: Optional[str] = Field(default=None, max_length=50)
    line_height: Optional[float] = Field(default=None, ge=1.0, le=3.0)
    bionic_reading_enabled: Optional[bool] = None
