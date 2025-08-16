import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuth } from '@/hooks/use-auth'
import { QuestCreatePage } from '@/features/quests/pages'

export const Route = createFileRoute('/_authenticated/quests/new')({
  beforeLoad: () => {
    const { user } = getAuth()
    const isAdmin = !!user?.roles.includes('admin')
    if (!isAdmin) throw redirect({ to: '/quests' })
  },
  component: QuestCreatePage,
  staticData: { title: 'New Quest', breadcrumb: 'New Quest' },
})
