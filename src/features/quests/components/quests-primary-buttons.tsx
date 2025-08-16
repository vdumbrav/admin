import { IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export const QuestsPrimaryButtons = () => {
  const { user } = useAuth()
  const isAdmin = user?.roles.includes('admin')
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
