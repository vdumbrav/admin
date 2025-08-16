import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

function Authenticated() {
  const auth = useAuth()
  if (auth.isLoading) return null
  if (!auth.isAuthenticated) throw redirect({ to: '/sign-in' })
  return <AuthenticatedLayout />
}

export const Route = createFileRoute('/_authenticated')({
  component: Authenticated,
})
