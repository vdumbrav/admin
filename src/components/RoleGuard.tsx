import { ReactNode, useEffect } from 'react'
import { Navigate } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { UserRole } from '@/auth/roles'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface RoleGuardProps {
  requiredRoles?: string[]
  children: ReactNode
  fallback?: ReactNode
  autoLogoutOnInsufficientRole?: boolean
  showToastOnLogout?: boolean
}

export function RoleGuard({
  requiredRoles = [UserRole.Admin, UserRole.Moderator],
  children,
  fallback,
  autoLogoutOnInsufficientRole = true,
  showToastOnLogout = true,
}: RoleGuardProps) {
  const { isLoading, isAuthenticated, hasAllowedRole, roles, signoutRedirect } =
    useAppAuth()

  const hasRequiredRole = requiredRoles.some((role) => roles.includes(role))

  // Auto logout effect for insufficient roles (must be before any returns)
  useEffect(() => {
    if (
      isAuthenticated &&
      !isLoading &&
      (!hasRequiredRole || !hasAllowedRole)
    ) {
      if (autoLogoutOnInsufficientRole) {
        if (showToastOnLogout) {
          const userRolesText = roles.length > 0 ? roles.join(', ') : 'none'
          const requiredRolesText = requiredRoles.join(' or ')
          toast.error(
            `У вас нет прав для входа в админку. Требуется роль: ${requiredRolesText}. Ваши роли: ${userRolesText}`,
            { duration: 3000 }
          )
        }

        // Logout after showing toast
        setTimeout(() => {
          signoutRedirect()
        }, 1500)
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    hasRequiredRole,
    hasAllowedRole,
    autoLogoutOnInsufficientRole,
    showToastOnLogout,
    roles,
    requiredRoles,
    signoutRedirect,
  ])

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
    if (autoLogoutOnInsufficientRole) {
      // Show loading while logout is in progress
      return (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
        </div>
      )
    }

    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6 text-center'>
            <h2 className='text-destructive mb-4 text-xl font-semibold'>
              Access Denied
            </h2>
            <p className='text-muted-foreground mb-4'>
              You need {requiredRoles.join(' or ')} role to access this
              application.
            </p>
            <p className='text-muted-foreground mb-6 text-sm'>
              Current roles: {roles.length > 0 ? roles.join(', ') : 'None'}
            </p>
            <Button onClick={signoutRedirect} variant='outline'>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <RoleGuard>{children}</RoleGuard>
}
