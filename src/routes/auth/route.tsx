import { createFileRoute, Outlet } from '@tanstack/react-router'

const AuthLayout = () => {
  return <Outlet />
}

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
})
