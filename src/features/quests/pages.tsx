import { useNavigate, useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { QuestForm } from './QuestForm';
import { useCreateQuest, useQuest, useUpdateQuest } from './api';
import { adaptQuestToTask, adaptTaskToQuest } from './data/adapters';
import type { Task } from './data/types';
import { getPreset, type PresetId } from './presets';
import { useQuestSearch } from './use-quest-search';

export const QuestCreatePage = () => {
  const create = useCreateQuest();
  const nav = useNavigate({});
  const search = useQuestSearch({
    from: '/_authenticated/quests/new' as const,
  });
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
          <Button variant='outline' onClick={() => void nav({ to: '/quests', search })}>
            Back to list
          </Button>
        </div>
        <QuestForm
          onSubmit={async (v) => {
            try {
              await create.mutateAsync(adaptTaskToQuest(v as Partial<Task>));
              toast.success('Saved');
              void nav({ to: '/quests', search });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Failed to save');
            }
          }}
          onCancel={() => void nav({ to: '/quests', search })}
        />
      </Main>
    </>
  );
};

export const QuestEditPage = () => {
  const { id } = useParams({ from: '/_authenticated/quests/$id' });
  const questId = Number(id);
  const { data } = useQuest(questId);
  const update = useUpdateQuest(questId);
  const nav = useNavigate({});
  const search = useQuestSearch({
    from: '/_authenticated/quests/$id' as const,
  });

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
    );
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
            <h2 className='text-2xl font-bold tracking-tight'>Edit Quest #{id}</h2>
            <p className='text-muted-foreground'>Update quest properties.</p>
          </div>
          <Button variant='outline' onClick={() => void nav({ to: '/quests', search })}>
            Back to list
          </Button>
        </div>
        <QuestForm
          initial={data ? adaptQuestToTask(data) : undefined}
          onSubmit={async (v) => {
            try {
              await update.mutateAsync(adaptTaskToQuest(v as Partial<Task>));
              toast.success('Saved');
              void nav({ to: '/quests', search });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Failed to save');
            }
          }}
          onCancel={() => void nav({ to: '/quests', search })}
        />
      </Main>
    </>
  );
};

export const QuestCreateWithPresetPage = () => {
  const { preset } = useParams({ from: '/_authenticated/quests/new/$preset' });
  const create = useCreateQuest();
  const nav = useNavigate({});
  const search = useQuestSearch({
    from: '/_authenticated/quests/new' as const,
  });

  // Get preset configuration
  const presetConfig = getPreset(preset as PresetId);

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
            <h2 className='text-2xl font-bold tracking-tight'>
              New Quest - {presetConfig.name} {presetConfig.icon}
            </h2>
            <p className='text-muted-foreground'>{presetConfig.description}</p>
          </div>
          <Button variant='outline' onClick={() => void nav({ to: '/quests', search })}>
            Back to list
          </Button>
        </div>
        <QuestForm
          onSubmit={async (v) => {
            try {
              await create.mutateAsync(adaptTaskToQuest(v as Partial<Task>));
              toast.success('Saved');
              void nav({ to: '/quests', search });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Failed to save');
            }
          }}
          onCancel={() => void nav({ to: '/quests', search })}
        />
      </Main>
    </>
  );
};
