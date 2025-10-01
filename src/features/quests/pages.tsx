import { Outlet, useNavigate, useParams, useRouterState, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Main } from '@/components/layout/main';
import { apiToForm } from './adapters/form-api-adapter';
import { useCreateQuest, useQuest, useUpdateQuest } from './api';
import { PresetSelection } from './components/preset-selection';
import { defaultQuestSearch } from './default-search';
import { QuestForm } from './form';
import { getPreset, getPresetSafe, type PresetId } from './presets';
import type { QuestFormValues } from './types/form-types';

export const QuestCreatePage = () => {
  const hasPreset = useRouterState({
    select: (s) => s.matches.some((m) => m.routeId === '/_authenticated/quests/new/$preset'),
  });
  // Read showForm from router search to stay reactive to URL changes
  const search = useSearch({ from: '/_authenticated/quests/new' as const });
  const showForm = search.showForm;
  const create = useCreateQuest();
  const nav = useNavigate({});

  return (
    <>
      <Main>
        {hasPreset ? (
          <Outlet />
        ) : showForm ? (
          <div>
            <div className='mx-auto mb-4 flex max-w-5xl items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight'>New Quest</h2>
                <p className='text-muted-foreground'>Create a new quest without preset.</p>
              </div>
              <Button
                variant='outline'
                onClick={() => void nav({ to: '/quests', search: defaultQuestSearch })}
              >
                Back to list
              </Button>
            </div>
            <QuestForm
              onSubmit={async (v: QuestFormValues) => {
                try {
                  await create.mutateAsync(v);
                  void nav({ to: '/quests', search: defaultQuestSearch });
                } catch (e) {
                  // Error already handled by mutation onError hook in api.ts
                  // Adding toast here would create duplicate error messages
                  console.error('Quest creation failed:', e);
                }
              }}
              onCancel={() => void nav({ to: '/quests', search: defaultQuestSearch })}
            />
          </div>
        ) : (
          <PresetSelection />
        )}
      </Main>
    </>
  );
};

export const QuestEditPage = () => {
  const { id } = useParams({ from: '/_authenticated/quests/$id' });
  const questId = Number(id);
  const { data, isLoading } = useQuest(questId);
  const update = useUpdateQuest(questId);
  const nav = useNavigate({});

  // Get preset configuration from existing quest data
  const presetConfig = data?.preset ? (getPresetSafe(data.preset) ?? undefined) : undefined;

  if (isLoading || !data) {
    return (
      <Main>
        <div className='max-w-5xl space-y-6'>
          {/* Header skeleton */}
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <div className='bg-muted h-8 w-48 animate-pulse rounded' />
              <div className='bg-muted h-5 w-80 animate-pulse rounded' />
            </div>
            <div className='bg-muted h-10 w-24 animate-pulse rounded' />
          </div>

          {/* Form skeleton */}
          <div className='space-y-6 rounded-lg border p-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='bg-muted h-4 w-20 animate-pulse rounded' />
                <div className='bg-muted h-10 w-full animate-pulse rounded' />
              </div>
              <div className='space-y-2'>
                <div className='bg-muted h-4 w-24 animate-pulse rounded' />
                <div className='bg-muted h-10 w-full animate-pulse rounded' />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='bg-muted h-4 w-32 animate-pulse rounded' />
              <div className='bg-muted h-24 w-full animate-pulse rounded' />
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <div className='space-y-2'>
                <div className='bg-muted h-4 w-16 animate-pulse rounded' />
                <div className='bg-muted h-10 w-full animate-pulse rounded' />
              </div>
              <div className='space-y-2'>
                <div className='bg-muted h-4 w-20 animate-pulse rounded' />
                <div className='bg-muted h-10 w-full animate-pulse rounded' />
              </div>
              <div className='space-y-2'>
                <div className='bg-muted h-4 w-18 animate-pulse rounded' />
                <div className='bg-muted h-10 w-full animate-pulse rounded' />
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className='flex gap-3 pt-4'>
              <div className='bg-muted h-10 w-20 animate-pulse rounded' />
              <div className='bg-muted h-10 w-24 animate-pulse rounded' />
            </div>
          </div>
        </div>
      </Main>
    );
  }

  return (
    <>
      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Edit Quest #{id}</h2>
            <p className='text-muted-foreground'>Update quest properties.</p>
          </div>
          <Button
            variant='outline'
            onClick={() => void nav({ to: '/quests', search: defaultQuestSearch })}
          >
            Back to list
          </Button>
        </div>
        <QuestForm
          presetConfig={presetConfig}
          initial={
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            data ? apiToForm(data) : undefined
          }
          onSubmit={async (v: QuestFormValues) => {
            try {
              await update.mutateAsync(v);
              void nav({ to: '/quests', search: defaultQuestSearch });
            } catch (e) {
              // Error toast already shown by mutation hook
              console.error('Quest update failed:', e);
            }
          }}
          onCancel={() => void nav({ to: '/quests', search: defaultQuestSearch })}
        />
      </Main>
    </>
  );
};

export const QuestCreateWithPresetPage = () => {
  const { preset } = useParams({ from: '/_authenticated/quests/new/$preset' });
  const create = useCreateQuest();
  const nav = useNavigate({});

  // Get preset configuration
  const presetConfig = getPreset(preset as PresetId);

  return (
    <>
      <Main>
        <div className='mb-4 flex max-w-5xl items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>New Quest</h2>
            <p className='text-muted-foreground'>Create a new quest</p>
            <p className='text-muted-foreground mt-4 text-sm'>{presetConfig.name}</p>
          </div>
          <Button
            variant='outline'
            onClick={() => void nav({ to: '/quests', search: defaultQuestSearch })}
          >
            Back to list
          </Button>
        </div>
        <QuestForm
          presetConfig={presetConfig}
          onSubmit={async (v: QuestFormValues) => {
            try {
              await create.mutateAsync(v);
              void nav({ to: '/quests', search: defaultQuestSearch });
            } catch (e) {
              // Error toast already shown by mutation hook
              console.error('Quest creation failed:', e);
            }
          }}
          onCancel={() => void nav({ to: '/quests', search: defaultQuestSearch })}
        />
      </Main>
    </>
  );
};
