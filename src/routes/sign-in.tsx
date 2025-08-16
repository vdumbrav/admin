import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const auth = useAppAuth()
  React.useEffect(() => {
    if (import.meta.env.VITE_USE_FAKE_AUTH === 'true') {
      window.location.replace(`${import.meta.env.BASE_URL}quests`)
    } else {
      auth.signinRedirect()
    }
  }, [auth])

  return (
    <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
      Signing in…
    </div>
  )
}
