import { createContext, useContext, useEffect, useState } from 'react'
import { setToken } from './auth-singleton'

type Role = 'admin' | 'user'
interface AuthContextValue {
  user: { role: Role } | null
  token: string | null
  loginAs: (role: Role) => void
  logout: () => void
}

const AuthMockContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthMockProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ role: Role } | null>(null)
  const [token, setTok] = useState<string | null>(null)

  useEffect(() => {
    const storedRole = localStorage.getItem('auth-role') as Role | null
    if (storedRole) {
      const t = 'mock-token'
      setUser({ role: storedRole })
      setTok(t)
      setToken(t)
    }
  }, [])

  const loginAs = (role: Role) => {
    const t = 'mock-token'
    setUser({ role })
    setTok(t)
    setToken(t)
    localStorage.setItem('auth-role', role)
  }

  const logout = () => {
    setUser(null)
    setTok(null)
    setToken(null)
    localStorage.removeItem('auth-role')
  }

  return (
    <AuthMockContext.Provider value={{ user, token, loginAs, logout }}>
      {children}
    </AuthMockContext.Provider>
  )
}

export const useAuthMock = () => {
  const ctx = useContext(AuthMockContext)
  if (!ctx) throw new Error('useAuthMock must be used within AuthMockProvider')
  return ctx
}
