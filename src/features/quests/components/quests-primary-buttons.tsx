import { Link, useSearch } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { useAppAuth } from '@/auth/provider'
import { Button } from '@/components/ui/button'

export const QuestsPrimaryButtons = () => {
  const auth = useAppAuth()
  const search = useSearch({ from: '/_authenticated/quests/' as const })
  if (!auth.hasRole('admin')) return null
  return (
    <Button asChild className='space-x-1'>
      <Link to='/quests/new' search={search}>
        <span>Create</span>
        <IconPlus size={18} />
      </Link>
    </Button>
  )
}
