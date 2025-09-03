import { createFileRoute } from '@tanstack/react-router'
import { requireModeratorOrAdminBeforeLoad } from '@/auth/guards'
import { ProtectedRoute } from '@/components/RoleGuard'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

function AuthenticatedRoute() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout />
    </ProtectedRoute>
  )
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: requireModeratorOrAdminBeforeLoad,
  component: AuthenticatedRoute,
})
