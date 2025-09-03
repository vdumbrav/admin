import { useEffect, useState } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { toast } from 'sonner'
import { defaultQuestSearch } from '@/features/quests/default-search'

export const Route = createFileRoute('/auth/callback')({
  component: CallbackPage,
})

function CallbackPage() {
  const {
    isAuthenticated,
    isLoading,
    hasAllowedRole,
    error,
    roles,
    signoutRedirect,
  } = useAppAuth()
  const [hasTriedLogout, setHasTriedLogout] = useState(false)

  // Auto logout effect for users without required roles
  useEffect(() => {
    if (isAuthenticated && !isLoading && !hasAllowedRole && !hasTriedLogout) {
      setHasTriedLogout(true)

      const userRolesText = roles.length > 0 ? roles.join(', ') : 'none'
      toast.error(
        `Access denied. Required roles: admin or moderator. Your roles: ${userRolesText}`,
        { duration: 3000 }
      )

      // Logout after showing toast
      setTimeout(() => {
        signoutRedirect()
      }, 2000)
    }
  }, [
    isAuthenticated,
    isLoading,
    hasAllowedRole,
    roles,
    signoutRedirect,
    hasTriedLogout,
  ])

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <div className='border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-muted-foreground'>Completing sign in...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <Navigate to='/sign-in' replace />
  }

  if (isAuthenticated && hasAllowedRole) {
    return <Navigate to='/quests' search={defaultQuestSearch} replace />
  }

  if (isAuthenticated && !hasAllowedRole) {
    if (hasTriedLogout) {
      // Show loading while logout is in progress
      return (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='space-y-4 text-center'>
            <div className='border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
            <p className='text-muted-foreground'>Signing out...</p>
          </div>
        </div>
      )
    }
    // This case will be handled by the useEffect above
  }

  return <Navigate to='/sign-in' replace />
}
