import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/quests/')({
  component: () => <Navigate to='/quests' />,
})
