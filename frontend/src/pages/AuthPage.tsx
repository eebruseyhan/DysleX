import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../context/auth'
import './Auth.css'

interface AuthPageProps {
  mode: 'login' | 'register'
}

export default function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/library'

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isLogin && password.length < 6) {
      setError('Şifre en az 6 karakter olmalı')
      return
    }
    setSubmitting(true)
    try {
      if (isLogin) await login(username.trim(), password)
      else await register(username.trim(), email.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Beklenmeyen bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card card">
        <div className="auth-head">
          <h1>{isLogin ? 'Tekrar hoş geldin' : 'Hesabını oluştur'}</h1>
          <p className="muted">
            {isLogin
              ? 'Kütüphanene ve okuma ayarlarına kaldığın yerden devam et.'
              : 'Dosyalarını yükle, sana en rahat gelen okuma düzenini kaydet.'}
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <Link
            to="/login"
            role="tab"
            aria-selected={isLogin}
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            id="tab-login"
          >
            Giriş yap
          </Link>
          <Link
            to="/register"
            role="tab"
            aria-selected={!isLogin}
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            id="tab-register"
          >
            Kayıt ol
          </Link>
          <span className={`auth-tab-indicator ${isLogin ? '' : 'right'}`} aria-hidden />
        </div>

        <form className="stack" onSubmit={handleSubmit} noValidate={false}>
          <div className="field">
            <label htmlFor="username">{isLogin ? 'Kullanıcı adı veya e-posta' : 'Kullanıcı adı'}</label>
            <input
              id="username"
              className="input"
              autoComplete="username"
              required
              minLength={isLogin ? 1 : 3}
              maxLength={isLogin ? 100 : 50}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isLogin ? 'ornek@eposta.com' : 'ornek_kullanici'}
            />
          </div>

          {!isLogin && (
            <div className="field">
              <label htmlFor="email">E-posta</label>
              <input
                id="email"
                type="email"
                className="input"
                autoComplete="email"
                required
                maxLength={100}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@eposta.com"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="password">Şifre</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={isLogin ? 1 : 6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? '••••••••' : 'En az 6 karakter'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? 'Gizle' : 'Göster'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button id="auth-submit" type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting && <span className="spinner" />}
            {isLogin ? 'Giriş yap' : 'Hesap oluştur'}
          </button>
        </form>

        <p className="auth-switch muted">
          {isLogin ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
          <Link to={isLogin ? '/register' : '/login'} className="gradient-text">
            {isLogin ? 'Kayıt ol' : 'Giriş yap'}
          </Link>
        </p>
      </div>
    </div>
  )
}
