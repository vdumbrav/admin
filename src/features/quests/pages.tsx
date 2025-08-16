import { useParams, useNavigate } from '@tanstack/react-router'
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
        <div className='mb-4 mx-auto max-w-5xl'>
          <h2 className='text-2xl font-bold tracking-tight'>New Quest</h2>
          <p className='text-muted-foreground'>Create a new quest.</p>
        </div>
        <QuestForm
          onSubmit={async (v) => {
            await create.mutateAsync(v)
            nav({ to: '/quests' })
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

  if (!data) return null
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
        <div className='mb-4'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Edit Quest #{id}
          </h2>
          <p className='text-muted-foreground'>Update quest properties.</p>
        </div>
        <QuestForm
          initial={data}
          onSubmit={async (v) => {
            await update.mutateAsync(v)
            nav({ to: '/quests' })
          }}
        />
      </Main>
    </>
  )
}
