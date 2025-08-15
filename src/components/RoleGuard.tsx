import { useAuth } from 'react-oidc-context'

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  if (auth.isLoading) return null
  const roles: string[] =
    (
      (auth.user?.profile?.realm_access as unknown as { roles?: string[] })?.
        roles ?? []
    )
  return roles.includes('admin') ? <>{children}</> : <div>Access denied</div>
}
