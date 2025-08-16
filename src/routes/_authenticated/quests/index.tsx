import { createFileRoute } from '@tanstack/react-router'
import { Quests } from '@/features/quests'
import { requireAdminBeforeLoad } from '@/auth/guards'

export const Route = createFileRoute('/_authenticated/quests/')({
  beforeLoad: requireAdminBeforeLoad,
  validateSearch: (search: Record<string, unknown>) => ({
    search: (search.search as string) ?? '',
    group: (search.group as string) ?? 'all',
    type: (search.type as string) ?? '',
    provider: (search.provider as string) ?? '',
    visible: (search.visible as string) ?? '',
    page: Number(search.page ?? 1),
    limit: Number(search.limit ?? 20),
    sort: (search.sort as string) ?? 'order_by:asc',
  }),
  component: Quests,
  staticData: { title: 'Quests', breadcrumb: 'Quests' },
})
