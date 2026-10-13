from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.database import check_db_connection
from app.routers import auth, documents, preferences

# Not: Tablolar veritabanında zaten mevcut olduğu için create_all kullanılmıyor.
# İleride şema değişiklikleri için Alembic eklenebilir.

app = FastAPI(
    title="DysleX API",
    description="Disleksi dostu okuma platformu - FastAPI & PostgreSQL",
    version="0.2.0",
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(preferences.router)


class StatusResponse(BaseModel):
    status: str
    message: str
    version: str


@app.get("/", response_model=StatusResponse)
async def root():
    return StatusResponse(
        status="success",
        message="DysleX Backend API çalışıyor!",
        version=app.version,
    )


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "DysleX Backend"}


@app.get("/api/db-check")
async def db_check():
    success, message = check_db_connection()
    return {
        "connected": success,
        "message": message
    }
