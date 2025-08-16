import React from 'react'
import { AuthProvider, useAuth as useRealAuth } from 'react-oidc-context'
import { oidcConfig } from './oidc'
import { MockAuthProvider, useMockAuth } from './mock'

const useFake = import.meta.env.VITE_USE_FAKE_AUTH === 'true'
const useAuthImpl = useFake ? useMockAuth : useRealAuth

interface AuthResult {
  isAuthenticated: boolean
  isLoading: boolean
  user: unknown
  signinRedirect: () => void
  signoutRedirect: () => void
  getAccessToken: () => string | undefined
}

export const AppAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  if (useFake) return <MockAuthProvider>{children}</MockAuthProvider>
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>
}

export function useAppAuth(): AuthResult {
  const a = useAuthImpl()
  return {
    isAuthenticated: a.isAuthenticated,
    isLoading: a.isLoading,
    user: a.user,
    signinRedirect: a.signinRedirect,
    signoutRedirect: a.signoutRedirect,
    getAccessToken: useFake
      ? (a as ReturnType<typeof useMockAuth>).getAccessToken
      : () => (a as ReturnType<typeof useRealAuth>).user?.access_token,
  }
}
