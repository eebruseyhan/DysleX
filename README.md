# DysleX

DysleX projesi için **Python (FastAPI)** backend, **PostgreSQL (SQLAlchemy)** veritabanı ve **React (TypeScript + Vite)** frontend mimarisi.

---

## 📁 Proje Yapısı

```text
DysleX/
├── backend/                      # Python FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py          # SQLAlchemy bağlantı motoru & session yönetimi
│   │   ├── models.py            # Veritabanı tabloları (User, Document vb.)
│   │   └── main.py              # FastAPI başlangıç noktası, CORS & /api/db-check
│   ├── venv/                    # Python sanal ortamı (virtualenv)
│   ├── .env                     # Yerel veritabanı bağlantı ayarları (gitignore'da)
│   ├── .env.example             # Örnek çevre değişkenleri şablonu
│   └── requirements.txt         # FastAPI, SQLAlchemy, psycopg, uvicorn vb.
├── frontend/                     # React + TypeScript Frontend (Vite)
│   ├── src/
│   │   ├── App.tsx              # Backend & DB durum kontrolü içeren kontrol paneli
│   │   ├── App.css              # Arayüz stilleri
│   │   └── main.tsx
│   ├── vite.config.ts           # Ters proxy (/api -> :8000)
│   └── package.json
└── README.md
```

---

## 🐘 Veritabanı (PostgreSQL / DBeaver) Entegrasyonu

DBeaver'da oluşturduğunuz veritabanının bağlantı bilgilerini [backend/.env](file:///Users/beru/Documents/DysleX/DysleX/backend/.env) dosyasına yazmanız yeterlidir:

```env
DB_USER=postgres
DB_PASSWORD=veritabani_sifreniz
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dbeaver_veritabani_adiniz
```

---

## 🚀 Başlangıç & Çalıştırma

### 1. Backend'i Başlatma

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

- **API Ana Sayfa:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **DB Bağlantı Testi:** [http://127.0.0.1:8000/api/db-check](http://127.0.0.1:8000/api/db-check)
- **Swagger Dokümantasyonu:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend'i Başlatma

```bash
cd frontend
npm run dev
```

- **Arayüz:** [http://localhost:5173](http://localhost:5173)
