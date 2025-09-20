import * as React from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useAppAuth } from '@/auth/hooks';
import { Input } from '@/components/ui/input';
import { getColumns } from './components/columns';
import { QuestsDataTable } from './components/data-table';
import { QuestsDialogs } from './components/quests-dialogs';
import { QuestsPrimaryButtons } from './components/quests-primary-buttons';
import { FiltersProvider } from './context/filters-context';
import { QuestsProvider } from './context/quests-context';
import { useFilters } from './hooks/use-filters';

function QuestsContent() {
  const auth = useAppAuth();
  const isAdmin = auth.isAdmin;
  const columns = React.useMemo(() => getColumns(isAdmin), [isAdmin]);
  const { search, setSearch } = useFilters();
  return (
    <QuestsProvider>
      <div className='flex h-full flex-1 flex-col'>
        {/* Page Header */}
        <div className='bg-background border-b px-6 py-4'>
          <div className='flex items-center justify-between gap-4'>
            {/* Left: Title + Description */}
            <div className='flex flex-col gap-1'>
              <h1 className='text-2xl leading-8 font-semibold'>Quests</h1>
              <p className='text-muted-foreground text-sm leading-5'>Manage quests</p>
            </div>

            {/* Center: Search */}
            <div className='mx-4 max-w-md flex-1'>
              <div className='relative'>
                <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                <Input
                  placeholder='Search quests...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>

            {/* Right: Create Button */}
            <QuestsPrimaryButtons />
          </div>
        </div>

        {/* Table Content */}
        <div className='flex-1 p-6'>
          <QuestsDataTable columns={columns} isAdmin={isAdmin} />
        </div>
      </div>
      <QuestsDialogs />
    </QuestsProvider>
  );
}

export const Quests = () => {
  return (
    <FiltersProvider>
      <QuestsContent />
    </FiltersProvider>
  );
};
