import { createFileRoute } from '@tanstack/react-router'
import { useRequireAdmin } from '@/router.guards'
import { QuestCreatePage } from '@/features/quests/pages'

export const Route = createFileRoute('/_authenticated/quests/new')({
  beforeLoad: useRequireAdmin,
  component: QuestCreatePage,
  staticData: { title: 'New Quest', breadcrumb: 'New Quest' },
})
