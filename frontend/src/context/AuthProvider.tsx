import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setUnauthorizedHandler, tokenStore } from '../api/client'
import type { User } from '../api/types'
import { AuthContext, type AuthContextValue } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()))

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  // Kayıtlı token varsa kullanıcıyı doğrula
  useEffect(() => {
    setUnauthorizedHandler(logout)
    if (!tokenStore.get()) return
    api
      .me()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setLoading(false))
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const res = await api.login({ username_or_email: usernameOrEmail, password })
    tokenStore.set(res.access_token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await api.register({ username, email, password })
    tokenStore.set(res.access_token)
    setUser(res.user)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
