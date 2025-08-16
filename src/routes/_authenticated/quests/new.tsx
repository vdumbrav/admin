import { createFileRoute } from '@tanstack/react-router'
import { requireAdminBeforeLoad } from '@/auth/guards'
import { QuestCreatePage } from '@/features/quests/pages'
import { parseQuestSearch } from '@/features/quests/default-search'

export const Route = createFileRoute('/_authenticated/quests/new')({
  beforeLoad: requireAdminBeforeLoad,
  validateSearch: parseQuestSearch,
  component: QuestCreatePage,
  staticData: { title: 'New Quest', breadcrumb: 'New Quest' },
})
