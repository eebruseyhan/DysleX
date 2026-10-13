"""
Veritabanındaki mevcut tablolarla birebir eşleşen SQLAlchemy modelleri.
(users, documents, user_preferences)

SQLAlchemy 2.0 tipli `Mapped[...]` stili kullanılır; böylece örnek
öznitelikleri (ör. `doc.title`) tip denetleyicisi tarafından doğru tiple görülür.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Optional[str]] = mapped_column(String(20), server_default="student")
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=func.current_timestamp()
    )

    documents: Mapped[list["Document"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan", passive_deletes=True
    )
    preferences: Mapped[Optional["UserPreference"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    title: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    extracted_text: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=func.current_timestamp()
    )

    owner: Mapped[Optional["User"]] = relationship(back_populates="documents")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    font_family: Mapped[Optional[str]] = mapped_column(String(50), server_default="Lexend")
    font_size: Mapped[Optional[int]] = mapped_column(server_default="16")
    background_color: Mapped[Optional[str]] = mapped_column(
        String(50), server_default="#FEFBEA"
    )
    line_height: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(3, 1), server_default="1.5"
    )
    bionic_reading_enabled: Mapped[Optional[bool]] = mapped_column(server_default="false")
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    user: Mapped[Optional["User"]] = relationship(back_populates="preferences")
