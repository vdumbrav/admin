import React, { createContext, useContext, useMemo } from 'react'

type MockUser = {
  profile: { sub: string; preferred_username: string; email?: string }
}
type Ctx = {
  isAuthenticated: boolean
  isLoading: boolean
  user?: MockUser
  signinRedirect: () => void
  signoutRedirect: () => void
  getAccessToken: () => string | undefined
}

const MockAuthContext = createContext<Ctx | null>(null)

export const MockAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const ctx = useMemo<Ctx>(
    () => ({
      isAuthenticated: true,
      isLoading: false,
      user: {
        profile: {
          sub: 'mock-user',
          preferred_username: 'dev',
          email: 'dev@example.com',
        },
      },
      signinRedirect: () => {},
      signoutRedirect: () => {},
      getAccessToken: () => 'mock_token',
    }),
    [],
  )
  return <MockAuthContext.Provider value={ctx}>{children}</MockAuthContext.Provider>
}

export const useMockAuth = () => {
  const v = useContext(MockAuthContext)
  if (!v) throw new Error('MockAuthContext missing')
  return v
}
