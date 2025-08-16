import React, { createContext, useContext, useMemo } from 'react'

type MockUser = {
  profile: { sub: string; preferred_username: string; email?: string }
  roles: string[]
}
type Ctx = {
  isAuthenticated: boolean
  isLoading: boolean
  user?: MockUser
  signinRedirect: () => void
  signoutRedirect: () => void
  getAccessToken: () => string | undefined
  roles: string[]
  hasRole: (role: string) => boolean
}

const MockAuthContext = createContext<Ctx | null>(null)

export const MockAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const ctx = useMemo<Ctx>(() => {
    const roles = ['admin']
    return {
      isAuthenticated: true,
      isLoading: false,
      user: {
        profile: {
          sub: 'mock-user',
          preferred_username: 'dev',
          email: 'dev@example.com',
        },
        roles,
      },
      signinRedirect: () => {},
      signoutRedirect: () => {},
      getAccessToken: () => 'mock_token',
      roles,
      hasRole: (role) => roles.includes(role),
    }
  }, [])
  return <MockAuthContext.Provider value={ctx}>{children}</MockAuthContext.Provider>
}

export const useMockAuth = () => {
  const v = useContext(MockAuthContext)
  if (!v) throw new Error('MockAuthContext missing')
  return v
}
