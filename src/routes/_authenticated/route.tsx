import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { requireAdminBeforeLoad } from '@/auth/guards'

function AuthenticatedRoute() {
  const auth = useAppAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate({ to: '/sign-in', replace: true })
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate])

  if (auth.isLoading) return <div className='p-4'>Loading…</div>
  if (auth.error) return <div className='p-4'>Sign-in failed</div>
  if (!auth.isAuthenticated) return <div className='p-4'>Redirecting…</div>
  return <AuthenticatedLayout />
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: requireAdminBeforeLoad,
  component: AuthenticatedRoute,
})
