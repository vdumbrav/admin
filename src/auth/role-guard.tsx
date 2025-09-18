import { ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { UserRole } from '@/auth/roles'

interface RoleGuardProps {
  requiredRoles?: string[]
  children: ReactNode
}

export function RoleGuard({
  requiredRoles = [UserRole.Admin, UserRole.Administrator, UserRole.Moderator, UserRole.Support],
  children,
}: RoleGuardProps) {
  const { isLoading, isAuthenticated, hasAllowedRole, roles } = useAppAuth()

  const hasRequiredRole = requiredRoles.some((role) => roles.includes(role))

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/sign-in' replace />
  }

  if (!hasRequiredRole || !hasAllowedRole) {
    return <Navigate to='/sign-in' replace />
  }

  return <>{children}</>
}

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <RoleGuard>{children}</RoleGuard>
}
