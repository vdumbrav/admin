import { createFileRoute } from '@tanstack/react-router'
import { QuestsListPage } from '@/features/quests/pages'

export const Route = createFileRoute('/_authenticated/quests/')({
  component: QuestsListPage,
  staticData: { title: 'Quests', breadcrumb: 'Quests' },
})
