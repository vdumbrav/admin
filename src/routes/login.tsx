import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const auth = useAuth()
  if (auth.isAuthenticated) return <Navigate to='/quests' />
  return (
    <div className="p-4">
      <button className="btn-primary" onClick={() => auth.signinRedirect()}>
        Login
      </button>
    </div>
  )
}
