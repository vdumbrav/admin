import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'

function SignIn() {
  const { isAuthenticated, isLoading, error, signinRedirect } = useAppAuth()
  const nav = useNavigate()
  useEffect(() => {
    if (isAuthenticated) nav({ to: '/quests' })
    else if (!isLoading && !error) signinRedirect()
  }, [isAuthenticated, isLoading, error, nav, signinRedirect])
  if (error) return <div className='p-4'>Sign-in failed</div>
  return <div className='p-4'>Signing in…</div>
}

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
})
