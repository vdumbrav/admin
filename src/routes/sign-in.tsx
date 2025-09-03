import { useCallback, useEffect } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { UserRole } from '@/auth/roles'
import { Loader2 } from 'lucide-react'
import { logError } from '@/utils/log'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { defaultQuestSearch } from '@/features/quests/default-search'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const {
    isAuthenticated,
    isLoading,
    hasAllowedRole,
    roles,
    signinRedirect,
    signoutRedirect,
    error,
  } = useAppAuth()

  // Auto-redirect for fake auth
  useEffect(() => {
    if (import.meta.env.VITE_USE_FAKE_AUTH === 'true') {
      window.location.replace(`${import.meta.env.BASE_URL}quests`)
      return
    }
  }, [])

  const handleSignIn = useCallback(() => {
    try {
      signinRedirect()
    } catch (e) {
      logError('signinRedirect failed', e)
    }
  }, [signinRedirect])

  // Auto-redirect to sign in for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      handleSignIn()
    }
  }, [isAuthenticated, isLoading, handleSignIn])

  // Redirect if authenticated and has proper role
  if (isAuthenticated && hasAllowedRole) {
    return <Navigate to='/quests' search={defaultQuestSearch} replace />
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  // Show role error if authenticated but insufficient role
  if (isAuthenticated && !hasAllowedRole) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-destructive text-center'>
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 text-center'>
            <p className='text-muted-foreground'>
              You need{' '}
              <span className='font-medium text-yellow-600'>
                {UserRole.Admin}
              </span>{' '}
              or{' '}
              <span className='font-medium text-sky-500'>
                {UserRole.Moderator}
              </span>{' '}
              role to access the admin panel.
            </p>
            <p className='text-muted-foreground text-sm'>
              Current role: {roles.includes('user') ? 'user' : 'unknown'}
            </p>
            <p className='text-muted-foreground text-sm'>
              Please contact your administrator to get the required permissions.
            </p>
            <div className='space-y-2'>
              <Button
                onClick={signoutRedirect}
                variant='outline'
                className='w-full'
              >
                Try Different Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if there was an auth error
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-destructive text-center'>
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 text-center'>
            <p className='text-muted-foreground'>
              There was an error during authentication. Please try again.
            </p>
            <Button onClick={handleSignIn} className='w-full'>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Retry Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading while redirecting
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='space-y-4 text-center'>
        <Loader2 className='mx-auto h-8 w-8 animate-spin' />
        <p className='text-muted-foreground'>Redirecting to sign in...</p>
      </div>
    </div>
  )
}
