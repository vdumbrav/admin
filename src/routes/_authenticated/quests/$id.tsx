import { createFileRoute } from '@tanstack/react-router'
import { requireAdminBeforeLoad } from '@/auth/guards'
import { parseQuestSearch } from '@/features/quests/default-search'
import { QuestEditPage } from '@/features/quests/pages'

export const Route = createFileRoute('/_authenticated/quests/$id')({
  beforeLoad: requireAdminBeforeLoad,
  validateSearch: parseQuestSearch,
  component: QuestEditPage,
  staticData: { title: 'Edit Quest', breadcrumb: 'Edit Quest' },
})
