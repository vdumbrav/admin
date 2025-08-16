import { useParams, useNavigate } from '@tanstack/react-router'
import type { Task } from '@/types/quests'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { QuestForm } from './QuestForm'
import { useCreateQuest, useQuest, useUpdateQuest } from './api'

export const QuestCreatePage = () => {
  const create = useCreateQuest()
  const nav = useNavigate({})
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mx-auto mb-4 flex max-w-5xl items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>New Quest</h2>
            <p className='text-muted-foreground'>Create a new quest.</p>
          </div>
          <Button variant='outline' onClick={() => nav({ to: '/quests' })}>
            Back to list
          </Button>
        </div>
        <QuestForm
          onSubmit={async (v) => {
            try {
              // backend accepts partial Task shape for children
              await create.mutateAsync(v as Partial<Task>)
              toast.success('Saved')
              nav({ to: '/quests' })
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Failed to save')
            }
          }}
        />
      </Main>
    </>
  )
}

export const QuestEditPage = () => {
  const { id } = useParams({ from: '/_authenticated/quests/$id' })
  const questId = Number(id)
  const { data } = useQuest(questId)
  const update = useUpdateQuest(questId)
  const nav = useNavigate({})

  if (!data) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ml-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='max-w-5xl space-y-3'>
            <div className='bg-muted h-7 w-48 animate-pulse rounded' />
            <div className='bg-muted h-5 w-80 animate-pulse rounded' />
            <div className='bg-muted h-64 w-full animate-pulse rounded' />
          </div>
        </Main>
      </>
    )
  }
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Edit Quest #{id}
            </h2>
            <p className='text-muted-foreground'>Update quest properties.</p>
          </div>
          <Button variant='outline' onClick={() => nav({ to: '/quests' })}>
            Back to list
          </Button>
        </div>
        <QuestForm
          initial={data}
          onSubmit={async (v) => {
            try {
              // backend accepts partial Task shape for children
              await update.mutateAsync(v as unknown as Partial<Task>)
              toast.success('Saved')
              nav({ to: '/quests' })
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Failed to save')
            }
          }}
        />
      </Main>
    </>
  )
}
