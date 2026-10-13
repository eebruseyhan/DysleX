import { useState, useEffect } from 'react'
import './App.css'

interface StatusInfo {
  status: 'connected' | 'connecting' | 'disconnected'
  message?: string
  data?: unknown
}

function App() {
  const [backendState, setBackendState] = useState<StatusInfo>({
    status: 'connecting',
    message: 'Backend kontrol ediliyor...',
  })

  const [dbState, setDbState] = useState<StatusInfo>({
    status: 'connecting',
    message: 'Veritabanı kontrol ediliyor...',
  })

  const checkBackend = async () => {
    setBackendState({ status: 'connecting', message: 'Bağlantı kuruluyor...' })
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        const data = await response.json()
        setBackendState({
          status: 'connected',
          message: 'FastAPI Backend çalışıyor!',
          data,
        })
      } else {
        setBackendState({
          status: 'disconnected',
          message: `Backend yanıt kodu: ${response.status}`,
        })
      }
    } catch {
      setBackendState({
        status: 'disconnected',
        message: 'Backend sunucusuna ulaşılamadı (http://localhost:8000 başlatıldı mı?)',
      })
    }
  }

  const checkDatabase = async () => {
    setDbState({ status: 'connecting', message: 'Veritabanı bağlantısı test ediliyor...' })
    try {
      const response = await fetch('/api/db-check')
      if (response.ok) {
        const data = await response.json()
        if (data.connected) {
          setDbState({
            status: 'connected',
            message: data.message || 'PostgreSQL bağlantısı başarılı!',
            data,
          })
        } else {
          setDbState({
            status: 'disconnected',
            message: data.message || 'Bağlantı sağlanamadı. backend/.env ayarlarını kontrol edin.',
            data,
          })
        }
      } else {
        setDbState({
          status: 'disconnected',
          message: `Sunucu hatası: ${response.status}`,
        })
      }
    } catch {
      setDbState({
        status: 'disconnected',
        message: 'Backend API henüz aktif değil.',
      })
    }
  }

  useEffect(() => {
    checkBackend()
    checkDatabase()
  }, [])

  const refreshAll = () => {
    checkBackend()
    checkDatabase()
  }

  return (
    <main className="dyslex-container">
      <header className="header">
        <div className="badge-group">
          <span className="badge">Python FastAPI</span>
          <span className="badge">PostgreSQL</span>
          <span className="badge">React 19 + TypeScript</span>
        </div>
        <h1 className="title">DysleX</h1>
        <p className="subtitle">
          Backend, Frontend ve Veritabanı (PostgreSQL) entegrasyonu hazırlandı.
        </p>
      </header>

      <section className="cards-grid">
        {/* Backend Card */}
        <div className="card">
          <h2 className="card-title">🐍 Backend (FastAPI)</h2>
          <p className="card-desc">
            Python sanal ortamı ve FastAPI REST API aktif. Otomatik OpenAPI/Swagger dokümantasyonu hazır.
          </p>
          <div
            className={`status-badge ${
              backendState.status === 'connected'
                ? 'status-connected'
                : backendState.status === 'connecting'
                ? 'status-connecting'
                : 'status-disconnected'
            }`}
          >
            <span className="status-dot"></span>
            {backendState.status === 'connected'
              ? 'Backend Aktif'
              : backendState.status === 'connecting'
              ? 'Kontrol Ediliyor...'
              : 'Bağlantı Yok'}
          </div>
          {backendState.data ? (
            <pre className="response-box">{JSON.stringify(backendState.data, null, 2)}</pre>
          ) : (
            <p className="card-desc">{backendState.message}</p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <button className="btn-primary" onClick={checkBackend}>
              Yeniden Test Et
            </button>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              Docs (/docs)
            </a>
          </div>
        </div>

        {/* Database Card */}
        <div className="card">
          <h2 className="card-title">🐘 Veritabanı (PostgreSQL)</h2>
          <p className="card-desc">
            SQLAlchemy ORM ve DBeaver bağlantısı. <code className="code-snippet">backend/.env</code> dosyasından yapılandırılır.
          </p>
          <div
            className={`status-badge ${
              dbState.status === 'connected'
                ? 'status-connected'
                : dbState.status === 'connecting'
                ? 'status-connecting'
                : 'status-disconnected'
            }`}
          >
            <span className="status-dot"></span>
            {dbState.status === 'connected'
              ? 'Veritabanı Bağlı'
              : dbState.status === 'connecting'
              ? 'Bağlanıyor...'
              : 'Bağlantı Bekleniyor'}
          </div>
          {dbState.data ? (
            <pre className="response-box">{JSON.stringify(dbState.data, null, 2)}</pre>
          ) : (
            <p className="card-desc">{dbState.message}</p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <button className="btn-primary" onClick={checkDatabase}>
              DB Test Et
            </button>
            <button className="btn-outline" onClick={refreshAll}>
              Tümünü Yenile
            </button>
          </div>
        </div>

        {/* Frontend Card */}
        <div className="card">
          <h2 className="card-title">⚛️ Frontend (React + TS)</h2>
          <p className="card-desc">
            Vite geliştirme sunucusu ve ters proxy aktif. API istekleri doğrudan FastAPI sunucusuna iletilir.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
            <div className="card-desc">
              Düzenlemek için: <code className="code-snippet">frontend/src/App.tsx</code>
            </div>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
              style={{ textAlign: 'center' }}
            >
              Arayüzü Aç (:5173)
            </a>
          </div>
        </div>
      </section>

      {/* Quick Setup Guide */}
      <section className="card">
        <h2 className="card-title">⚙️ DBeaver / PostgreSQL Bağlantı Ayarları</h2>
        <p className="card-desc">
          DBeaver'da oluşturduğunuz veritabanı adı, kullanıcı ve şifrenizi <code className="code-snippet">backend/.env</code> dosyasına girebilirsiniz:
        </p>
        <pre className="response-box">
{`DB_USER=postgres
DB_PASSWORD=dbeaver_sifreniz
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dbeaver_veritabani_adiniz`}
        </pre>
      </section>
    </main>
  )
}

export default App
