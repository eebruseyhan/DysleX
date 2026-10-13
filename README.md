# DysleX

DysleX projesi için **Python (FastAPI)** backend ve **React (TypeScript + Vite)** frontend mimarisi.

---

## 📁 Proje Yapısı

```text
DysleX/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py          # FastAPI başlangıç noktası & CORS ayarları
│   ├── venv/                # Python sanal ortamı (virtualenv)
│   └── requirements.txt     # Python bağımlılıkları
├── frontend/                 # React + TypeScript Frontend (Vite)
│   ├── src/
│   │   ├── App.tsx          # Ana React bileşeni (Backend durum kontrolü)
│   │   ├── App.css          # Arayüz stilleri
│   │   └── main.tsx
│   ├── vite.config.ts       # Vite & Backend proxy ayarları (/api -> :8000)
│   └── package.json
└── README.md
```

---

## 🚀 Başlangıç & Çalıştırma

### 1. Backend'i Başlatma

Ayrı bir terminal penceresinde:

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

- **API Adresi:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Otomatik Swagger Dokümantasyonu:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend'i Başlatma

Başka bir terminal penceresinde:

```bash
cd frontend
npm run dev
```

- **Frontend Arayüzü:** [http://localhost:5173](http://localhost:5173)
