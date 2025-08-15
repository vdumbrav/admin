import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthMock } from '@/lib/auth-mock'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const { loginAs } = useAuthMock()
  const navigate = useNavigate({ from: '/auth' })
  return (
    <div className='flex h-screen items-center justify-center gap-4'>
      <button
        onClick={() => {
          loginAs('admin')
          navigate({ to: '/quests' })
        }}
      >
        Login as Admin
      </button>
      <button
        onClick={() => {
          loginAs('user')
          navigate({ to: '/quests' })
        }}
      >
        Login as User
      </button>
    </div>
  )
}
