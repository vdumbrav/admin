import { createContext, useContext, useEffect, useState } from 'react'
import { setToken } from './auth-singleton'

type Role = 'admin' | 'user'

interface AuthContextValue {
  user: { role: Role } | null
  token: string | null
  loginAs: (role: Role) => void
  logout: () => void
}

const AuthMockContext = createContext<AuthContextValue | null>(null)

export const AuthMockProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ role: Role } | null>(null)
  const [token, setTokenState] = useState<string | null>(null)

  useEffect(() => {
    const storedRole = localStorage.getItem('auth_role') as Role | null
    const storedToken = localStorage.getItem('auth_token')
    if (storedRole && storedToken) {
      setUser({ role: storedRole })
      setTokenState(storedToken)
      setToken(storedToken)
    }
  }, [])

  const loginAs = (role: Role) => {
    const t = `mock-${role}`
    localStorage.setItem('auth_role', role)
    localStorage.setItem('auth_token', t)
    setUser({ role })
    setTokenState(t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('auth_role')
    localStorage.removeItem('auth_token')
    setUser(null)
    setTokenState(null)
    setToken(null)
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
