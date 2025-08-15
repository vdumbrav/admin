import { createContext, useContext, useState, ReactNode } from 'react'
import { setAuthToken } from './auth-singleton'

type Role = 'admin' | 'user'
interface User {
  role: Role
}
interface AuthContext {
  user: User | null
  loginAs: (role: Role) => void
  logout: () => void
  token: string | null
}

const AuthMockContext = createContext<AuthContext | null>(null)

export function AuthMockProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('auth-token')
    if (stored) setAuthToken(stored)
    return stored
  })
  const [user, setUser] = useState<User | null>(() => {
    const role = localStorage.getItem('auth-role') as Role | null
    return role ? { role } : null
  })

  const loginAs = (role: Role) => {
    const t = `${role}-token`
    setUser({ role })
    setToken(t)
    localStorage.setItem('auth-role', role)
    localStorage.setItem('auth-token', t)
    setAuthToken(t)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth-role')
    localStorage.removeItem('auth-token')
    setAuthToken(null)
  }

  return (
    <AuthMockContext.Provider value={{ user, loginAs, logout, token }}>
      {children}
    </AuthMockContext.Provider>
  )
}

export function useAuthMock(): AuthContext {
  const ctx = useContext(AuthMockContext)
  if (!ctx) throw new Error('useAuthMock must be used within AuthMockProvider')
  return ctx
}
