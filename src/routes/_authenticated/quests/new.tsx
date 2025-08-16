import { createFileRoute } from '@tanstack/react-router'
import { QuestCreatePage } from '@/features/quests/pages'
import { useRequireAdmin } from '@/router.guards'

export const Route = createFileRoute('/_authenticated/quests/new')({
  beforeLoad: useRequireAdmin,
  component: QuestCreatePage,
  staticData: { title: 'New Quest', breadcrumb: 'New Quest' },
})
