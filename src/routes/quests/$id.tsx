import { createFileRoute } from '@tanstack/react-router'
import { QuestEditPage } from '@/features/quests/pages'

export const Route = createFileRoute('/quests/$id')({
  component: QuestEditPage,
})

