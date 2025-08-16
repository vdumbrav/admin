import { createFileRoute } from '@tanstack/react-router'
import { QuestCreatePage } from '@/features/quests/pages'

export const Route = createFileRoute('/_authenticated/quests/new')({
  component: QuestCreatePage,
  staticData: { title: 'New Quest', breadcrumb: 'New Quest' },
})
