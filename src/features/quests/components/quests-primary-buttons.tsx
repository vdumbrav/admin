import { Link } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export const QuestsPrimaryButtons = () => {
  return (
    <Button asChild className='space-x-1'>
      <Link to='/quests/new'>
        <span>Create</span>
        <IconPlus size={18} />
      </Link>
    </Button>
  )
}
