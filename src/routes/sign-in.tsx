import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { logError } from '@/utils/log'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const { isAuthenticated, isLoading, signinRedirect } = useAppAuth()
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.replace(`${import.meta.env.BASE_URL}quests`)
      return
    }
    if (import.meta.env.VITE_USE_FAKE_AUTH === 'true') {
      window.location.replace(`${import.meta.env.BASE_URL}quests`)
      return
    }
    if (!isLoading) {
      try {
        signinRedirect()
      } catch (e) {
        logError('signinRedirect failed', e)
      }
    }
  }, [isAuthenticated, isLoading, signinRedirect])

  return (
    <div className='text-muted-foreground flex h-[60vh] items-center justify-center'>
      Signing in…
    </div>
  )
}
