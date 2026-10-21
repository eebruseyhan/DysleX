import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { IconLogout } from './Icons'
import './Navbar.css'

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="DysleX ana sayfa">
      <span className="logo-mark" aria-hidden>
        D
      </span>
      <span className="logo-text">
        Dysle<span className="gradient-text">X</span>
      </span>
    </Link>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <nav className="container navbar-inner" aria-label="Ana menü">
        <Logo />
        {user ? (
          <div className="row">
            <NavLink to="/library" className="nav-link">
              Kütüphanem
            </NavLink>
            <span className="nav-user" title={user.email}>
              <span className="avatar" aria-hidden>
                {user.username.slice(0, 1).toUpperCase()}
              </span>
              <span className="nav-username">{user.username}</span>
            </span>
            <button
              id="logout-button"
              className="icon-btn"
              onClick={handleLogout}
              aria-label="Çıkış yap"
              title="Çıkış yap"
            >
              <IconLogout size={18} />
            </button>
          </div>
        ) : (
          <div className="row">
            <Link to="/login" className="btn btn-ghost btn-sm" id="nav-login">
              Giriş yap
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm" id="nav-register">
              Ücretsiz başla
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
