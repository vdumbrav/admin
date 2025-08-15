import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RoleGuard } from '@/components/RoleGuard'

export const Route = createFileRoute('/quests/__layout')({
  component: () => (
    <RoleGuard role="admin">
      <Outlet />
    </RoleGuard>
  ),
})

