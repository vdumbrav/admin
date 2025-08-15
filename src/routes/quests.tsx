import { createFileRoute } from '@tanstack/react-router'
import { RoleGuard } from '@/components/RoleGuard'

export const Route = createFileRoute('/quests')({
  component: () => (
    <RoleGuard>
      <div>Quests</div>
    </RoleGuard>
  ),
})
