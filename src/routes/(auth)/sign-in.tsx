import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAppAuth } from '@/auth/provider'

function SignIn() {
  const auth = useAppAuth()
  const nav = useNavigate()
  useEffect(() => {
    if (auth.isAuthenticated) nav({ to: '/quests' })
    else auth.signinRedirect()
  }, [auth, nav])
  return <div className='p-4'>Signing in…</div>
}

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
})
