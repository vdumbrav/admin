import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuth } from '@/hooks/use-auth'
import { QuestEditPage } from '@/features/quests/pages'

export const Route = createFileRoute('/_authenticated/quests/$id')({
  beforeLoad: () => {
    const { user } = getAuth()
    const isAdmin = !!user?.roles.includes('admin')
    if (!isAdmin) throw redirect({ to: '/quests' })
  },
  component: QuestEditPage,
  staticData: { title: 'Edit Quest', breadcrumb: 'Edit Quest' },
})
