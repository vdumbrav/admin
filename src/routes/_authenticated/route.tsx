import { createFileRoute } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

function AuthenticatedRoute() {
  const auth = useAppAuth()
  if (auth.isLoading) return <div className='p-4'>Loading…</div>
  if (auth.error) return <div className='p-4'>Sign-in failed</div>
  if (!auth.isAuthenticated) return <div className='p-4'>Redirecting…</div>
  return <AuthenticatedLayout />
}

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedRoute,
})
