import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")


class Settings:
    # JWT (sabit varsayılan yok: .env'den gelmek zorunda)
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Dosya yükleme
    UPLOAD_DIR: Path = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "20"))
    ALLOWED_EXTENSIONS: set[str] = {".pdf", ".docx", ".txt"}

    # CORS
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if o.strip()
    ]


settings = Settings()
if not settings.JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY tanımlı değil. backend/.env dosyasına ekleyin: "
        "python -c \"import secrets; print(secrets.token_hex(32))\""
    )
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
