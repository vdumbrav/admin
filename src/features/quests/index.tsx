import * as React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getColumns } from './components/columns'
import { QuestsDataTable } from './components/data-table'
import { QuestsDialogs } from './components/quests-dialogs'
import { QuestsPrimaryButtons } from './components/quests-primary-buttons'
import { QuestsProvider } from './context/quests-context'

export const Quests = () => {
  const { user } = useAuth()
  const roles =
    (user?.profile && (user.profile as { roles?: string[] | string }).roles) ||
    []
  const isAdmin = Array.isArray(roles)
    ? roles.includes('admin')
    : roles === 'admin'
  const columns = React.useMemo(() => getColumns(isAdmin), [isAdmin])
  return (
    <QuestsProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Quests</h2>
            <p className='text-muted-foreground'>Manage quests</p>
          </div>
          <QuestsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <QuestsDataTable columns={columns} isAdmin={isAdmin} />
        </div>
      </Main>
      <QuestsDialogs />
    </QuestsProvider>
  )
}
