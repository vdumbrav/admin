import { Navigate } from '@tanstack/react-router'
import { useAuthMock } from '@/lib/auth-mock'

export function RoleGuard({ role = 'admin', children }: { role?: 'admin' | 'user'; children: React.ReactNode }) {
  const { user } = useAuthMock()
  if (!user) return <Navigate to='/auth' />
  if (role === 'admin' && user.role !== 'admin') return <Navigate to='/auth' />
  return <>{children}</>
}
