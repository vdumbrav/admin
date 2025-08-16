import { Link } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export const QuestsPrimaryButtons = () => {
  const { user } = useAuth()
  const roles =
    (user?.profile && (user.profile as { roles?: string[] | string }).roles) ||
    []
  const isAdmin = Array.isArray(roles)
    ? roles.includes('admin')
    : roles === 'admin'
  if (!isAdmin) return null
  return (
    <Button asChild className='space-x-1'>
      <Link to='/quests/new'>
        <span>Create</span>
        <IconPlus size={18} />
      </Link>
    </Button>
  )
}
