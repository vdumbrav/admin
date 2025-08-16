import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const { signinRedirect } = useAppAuth()
  React.useEffect(() => {
    if (import.meta.env.VITE_USE_FAKE_AUTH === 'true') {
      window.location.replace(`${import.meta.env.BASE_URL}quests`)
    } else {
      signinRedirect()
    }
  }, [signinRedirect])

  return (
    <div className='text-muted-foreground flex h-[60vh] items-center justify-center'>
      Signing in…
    </div>
  )
}
