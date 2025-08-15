import { useAuth } from 'react-oidc-context'
import { Navigate } from '@tanstack/react-router'

export function RoleGuard({ role = 'admin', children }: { role?: 'admin' | 'user'; children: React.ReactNode }) {
  const auth = useAuth()
  if (auth.isLoading) return null
  if (!auth.user) return <Navigate to="/login" />
  const roles: string[] = (
    (auth.user?.profile as { realm_access?: { roles?: string[] } } | undefined)?.realm_access?.roles ?? []
  )
  if (role === 'admin' && !roles.includes('admin')) return <>Access denied</>
  return <>{children}</>
}
