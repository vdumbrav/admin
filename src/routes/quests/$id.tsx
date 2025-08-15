import { createFileRoute } from '@tanstack/react-router'
import { QuestEditPage } from '@/features/quests/pages'
import { RoleGuard } from '@/components/RoleGuard'

export const Route = createFileRoute('/quests/$id')({
  component: () => (
    <RoleGuard role='admin'>
      <QuestEditPage />
    </RoleGuard>
  ),
})

