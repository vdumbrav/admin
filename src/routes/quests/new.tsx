import { createFileRoute } from '@tanstack/react-router'
import { QuestCreatePage } from '@/features/quests/pages'

export const Route = createFileRoute('/quests/new')({
  component: QuestCreatePage,
})

