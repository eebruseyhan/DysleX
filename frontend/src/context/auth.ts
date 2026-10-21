import { createContext, useContext } from 'react'
import type { User } from '../api/types'

export interface AuthContextValue {
  user: User | null
  /** İlk yüklemede token doğrulanırken true */
  loading: boolean
  login: (usernameOrEmail: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı')
  return ctx
}
