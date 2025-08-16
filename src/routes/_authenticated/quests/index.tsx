import { createFileRoute } from '@tanstack/react-router'
import { Quests } from '@/features/quests'

export const Route = createFileRoute('/_authenticated/quests/')({
  component: Quests,
  staticData: { title: 'Quests', breadcrumb: 'Quests' },
})
