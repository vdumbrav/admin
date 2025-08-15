import { createFileRoute } from '@tanstack/react-router'

const AuthPage = () => {
  return <div>Auth page</div>
}

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})
