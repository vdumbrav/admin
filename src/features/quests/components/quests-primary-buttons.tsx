import { Link } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '@/auth/provider'

export const QuestsPrimaryButtons = () => {
  const auth = useAppAuth()
  if (!auth.hasRole('admin')) return null
  return (
    <Button asChild className='space-x-1'>
      <Link to='/quests/new'>
        <span>Create</span>
        <IconPlus size={18} />
      </Link>
    </Button>
  )
}
