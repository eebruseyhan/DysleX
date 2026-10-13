import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# .env dosyasını backend dizininden yükle
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "dyslex_db")

custom_database_url = os.getenv("DATABASE_URL")
if custom_database_url:
    DATABASE_URL = custom_database_url
else:
    DATABASE_URL = URL.create(
        drivername="postgresql+psycopg",
        username=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=int(DB_PORT) if DB_PORT else 5432,
        database=DB_NAME,
    )

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Kopan bağlantıları otomatik yeniler
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    """FastAPI rotalarında veritabanı oturumu dependency olarak kullanılır."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_connection():
    """Veritabanı bağlantısını test eder."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True, "Veritabanı bağlantısı başarılı!"
    except Exception as e:
        return False, str(e)
