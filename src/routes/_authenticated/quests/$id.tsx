import { createFileRoute } from '@tanstack/react-router'
import { QuestEditPage } from '@/features/quests/pages'

export const Route = createFileRoute('/_authenticated/quests/$id')({
  component: QuestEditPage,
  staticData: { title: 'Edit Quest', breadcrumb: 'Edit Quest' },
})
