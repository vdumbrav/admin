import { createFileRoute } from '@tanstack/react-router'
import { QuestsListPage } from '@/features/quests/pages'

export const Route = createFileRoute('/quests/')({
  component: QuestsListPage,
})
