import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth'

function FullScreenLoader() {
  return (
    <div className="center-screen" role="status" aria-live="polite">
      <div className="row muted">
        <span className="spinner" /> Yükleniyor...
      </div>
    </div>
  )
}

/** Sadece giriş yapmış kullanıcılar */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

/** Giriş yapmış kullanıcıyı kütüphaneye yönlendirir (login/register sayfaları) */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (user) return <Navigate to="/library" replace />
  return <>{children}</>
}
