import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuthMock } from '@/lib/auth-mock'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const { loginAs } = useAuthMock()
  const navigate = useNavigate({})

  const handle = (role: 'admin' | 'user') => {
    loginAs(role)
    navigate({ to: '/quests' })
  }

  return (
    <div className='flex flex-col items-center gap-4 py-10'>
      <Button onClick={() => handle('admin')}>Login as Admin</Button>
      <Button onClick={() => handle('user')}>Login as User</Button>
    </div>
  )
}
