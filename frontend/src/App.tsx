import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { GuestRoute, ProtectedRoute } from './components/RouteGuards'
import AuthPage from './pages/AuthPage'
import Landing from './pages/Landing'
import Library from './pages/Library'
import Reader from './pages/Reader'

export default function App() {
  const { pathname } = useLocation()
  // Okuma ekranı odaklanma için kendi üst çubuğunu kullanır
  const immersive = pathname.startsWith('/read/')

  return (
    <>
      {!immersive && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AuthPage mode="login" />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <AuthPage mode="register" />
            </GuestRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
        <Route
          path="/read/:id"
          element={
            <ProtectedRoute>
              <Reader />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
