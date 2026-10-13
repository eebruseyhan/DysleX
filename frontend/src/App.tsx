import { useState, useEffect } from 'react'
import './App.css'

interface BackendStatus {
  status: 'connected' | 'connecting' | 'disconnected'
  message?: string
  data?: unknown
}

function App() {
  const [backendState, setBackendState] = useState<BackendStatus>({
    status: 'connecting',
    message: 'Backend kontrol ediliyor...',
  })

  const checkBackend = async () => {
    setBackendState({ status: 'connecting', message: 'Bağlantı kuruluyor...' })
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        const data = await response.json()
        setBackendState({
          status: 'connected',
          message: 'FastAPI Backend başarıyla bağlandı!',
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

  useEffect(() => {
    checkBackend()
  }, [])

  return (
    <main className="dyslex-container">
      <header className="header">
        <div className="badge-group">
          <span className="badge">Python FastAPI</span>
          <span className="badge">React 19 + TypeScript</span>
          <span className="badge">Vite</span>
        </div>
        <h1 className="title">DysleX</h1>
        <p className="subtitle">
          Backend ve Frontend kurulumu başarıyla tamamlandı. Geliştirmeye hemen başlayabilirsiniz!
        </p>
      </header>

      <section className="cards-grid">
        {/* Backend Card */}
        <div className="card">
          <h2 className="card-title">🐍 Backend (FastAPI)</h2>
          <p className="card-desc">
            Python sanal ortamı (venv) ve FastAPI REST API hazır. Otomatik Swagger dokümantasyonu aktif.
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
              ? 'Bağlantı Başarılı'
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
              API Docs (/docs)
            </a>
          </div>
        </div>

        {/* Frontend Card */}
        <div className="card">
          <h2 className="card-title">⚛️ Frontend (React + TS)</h2>
          <p className="card-desc">
            Vite ile ultra hızlı HMR, TypeScript tip güvenliği ve yapılandırılmış ters proxy (<code className="code-snippet">/api</code> ➔ <code className="code-snippet">:8000</code>).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
            <div className="card-desc">
              Düzenlemek için: <code className="code-snippet">frontend/src/App.tsx</code>
            </div>
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
              style={{ textAlign: 'center' }}
            >
              Vite Dokümantasyonu
            </a>
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="card">
        <h2 className="card-title">🚀 Hızlı Başlatma Komutları</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <strong>Backend Başlatma:</strong>
            <pre className="response-box">cd backend &amp;&amp; source venv/bin/activate &amp;&amp; uvicorn app.main:app --reload --port 8000</pre>
          </div>
          <div>
            <strong>Frontend Başlatma:</strong>
            <pre className="response-box">cd frontend &amp;&amp; npm run dev</pre>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
