import React from 'react'
import { AxiosRequestConfig } from 'axios'
import { useAuth } from 'react-oidc-context'
import { setAuthenticatedMutator } from './authenticatedMutator'
import { orvalMutator } from './orvalMutator'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  React.useEffect(() => {
    // Set the global authenticated mutator
    const authenticatedMutator = async function <TResponse>(
      config: AxiosRequestConfig
    ): Promise<TResponse> {
      // Add auth header if user is authenticated
      if (auth.user?.access_token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${auth.user.access_token}`,
        }
      }

      return orvalMutator<TResponse>(config)
    }

    setAuthenticatedMutator(authenticatedMutator)
  }, [auth.user?.access_token])

  return <>{children}</>
}
