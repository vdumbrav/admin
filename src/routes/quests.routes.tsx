import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RoleGuard } from '@/components/RoleGuard'
import { QuestsListPage, QuestCreatePage, QuestEditPage } from '@/features/quests/pages'

export const Route = createFileRoute("/quests/routes")({
  component: () => (
    <RoleGuard role="admin">
      <Outlet />
    </RoleGuard>
  ),
})

export const IndexRoute = createFileRoute("/quests/")({
  component: QuestsListPage,
})

export const NewRoute = createFileRoute("/quests/new")({
  component: QuestCreatePage,
})

export const EditRoute = createFileRoute("/quests/$id")({
  component: QuestEditPage,
})
