import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuthMock } from '@/lib/auth-mock'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const { loginAs } = useAuthMock()
  const navigate = useNavigate()
  return (
    <div className='flex min-h-screen items-center justify-center gap-4'>
      <Button
        onClick={() => {
          loginAs('admin')
          navigate({ to: '/quests' })
        }}
      >
        Login as Admin
      </Button>
      <Button
        onClick={() => {
          loginAs('user')
          navigate({ to: '/quests' })
        }}
      >
        Login as User
      </Button>
    </div>
  )
}
