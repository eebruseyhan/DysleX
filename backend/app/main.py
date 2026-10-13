from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="DysleX API",
    description="DysleX Backend API with FastAPI",
    version="0.1.0"
)

# CORS ayarları - Vite dev sunucusundan gelen isteklere izin veriyoruz
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StatusResponse(BaseModel):
    status: str
    message: str
    version: str

@app.get("/", response_model=StatusResponse)
async def root():
    return StatusResponse(
        status="success",
        message="DysleX Backend API çalışıyor!",
        version="0.1.0"
    )

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "DysleX Backend"}
