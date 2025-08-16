import { createFileRoute } from '@tanstack/react-router'
import { RoleGuard } from '@/components/RoleGuard'
import { QuestCreatePage } from '@/features/quests/pages'

export const Route = createFileRoute('/_authenticated/quests/new')({
  component: () => (
    <RoleGuard role='admin'>
      <QuestCreatePage />
    </RoleGuard>
  ),
  staticData: { title: 'New Quest', breadcrumb: 'New Quest' },
})
