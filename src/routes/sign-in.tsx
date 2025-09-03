import * as React from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { UserRole } from '@/auth/roles'
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
    error,
  } = useAppAuth()
  const [hasTriedLogin, setHasTriedLogin] = React.useState(false)

  // Auto-redirect for fake auth
  React.useEffect(() => {
    if (import.meta.env.VITE_USE_FAKE_AUTH === 'true') {
      window.location.replace(`${import.meta.env.BASE_URL}quests`)
      return
    }
  }, [])

  // Redirect if authenticated and has proper role
  if (isAuthenticated && hasAllowedRole) {
    return <Navigate to='/quests' search={defaultQuestSearch} replace />
  }

  const handleSignIn = () => {
    try {
      setHasTriedLogin(true)
      signinRedirect()
    } catch (e) {
      logError('signinRedirect failed', e)
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
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
              You need {UserRole.Admin} or {UserRole.Moderator} role to access
              the admin panel.
            </p>
            <p className='text-muted-foreground text-sm'>
              Current roles: {roles.length > 0 ? roles.join(', ') : 'None'}
            </p>
            <p className='text-muted-foreground text-sm'>
              Please contact your administrator to get the required permissions.
            </p>
            <div className='space-y-2'>
              <Button
                onClick={handleSignIn}
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
              Retry Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show login prompt or signing in state
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-center'>Admin Panel Sign In</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          {hasTriedLogin ? (
            <>
              <div className='border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
              <p className='text-muted-foreground'>Redirecting to sign in...</p>
            </>
          ) : (
            <>
              <p className='text-muted-foreground'>
                Access to the admin panel requires {UserRole.Admin} or{' '}
                {UserRole.Moderator} role.
              </p>
              <Button onClick={handleSignIn} className='w-full'>
                Sign In with Keycloak
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
