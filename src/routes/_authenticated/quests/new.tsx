import { createFileRoute } from '@tanstack/react-router'
import { QuestCreatePage } from '@/features/quests/pages'
import { RoleGuard } from '@/components/RoleGuard'

export const Route = createFileRoute('/_authenticated/quests/new')({
  component: () => (
    <RoleGuard role='admin'>
      <QuestCreatePage />
    </RoleGuard>
  ),
  staticData: { title: 'New Quest', breadcrumb: 'New Quest' },
})
