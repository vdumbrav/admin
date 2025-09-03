import { createFileRoute } from '@tanstack/react-router'
import { requireModeratorOrAdminBeforeLoad } from '@/auth/guards'
import { Quests } from '@/features/quests'
import { parseQuestSearch } from '@/features/quests/default-search'

export const Route = createFileRoute('/_authenticated/quests/')({
  beforeLoad: requireModeratorOrAdminBeforeLoad,
  validateSearch: parseQuestSearch,
  component: Quests,
  staticData: { title: 'Quests', breadcrumb: 'Quests' },
})
