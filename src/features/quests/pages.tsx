import { Outlet, useNavigate, useParams, useRouterState, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Main } from '@/components/layout/main';
import { apiToForm, formToApi } from './adapters/form-api-adapter';
import { useCreateQuest, useQuest, useUpdateQuest } from './api';
import { PresetSelection } from './components/preset-selection';
import type { QuestWithDates } from './data/types';
import { createQuestSearch } from './default-search';
import { QuestForm } from './form';
import { getPreset, type PresetId } from './presets';
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
  // No need to propagate table search params on create routes
  const listSearch = {
    search: '',
    group: 'all',
    type: '',
    provider: '',
    enabled: '',
    page: 1,
    limit: 20,
    sort: 'order_by:asc',
    showForm: false,
  } as const;

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
                onClick={() => void nav({ to: '/quests', search: createQuestSearch() })}
              >
                Back to list
              </Button>
            </div>
            <QuestForm
              onSubmit={async (v: QuestFormValues) => {
                try {
                  const questData = formToApi(v);
                  const withSchedule: Partial<QuestWithDates> = {
                    ...questData,
                    started_at: v.start,
                    completed_at: v.end,
                  };
                  await create.mutateAsync(withSchedule);
                  toast.success('Quest saved successfully');
                  void nav({ to: '/quests', search: listSearch });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Failed to save');
                }
              }}
              onCancel={() => void nav({ to: '/quests', search: listSearch })}
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
  const { data } = useQuest(questId);
  const update = useUpdateQuest(questId);
  const nav = useNavigate({});
  const listSearch = {
    search: '',
    group: 'all',
    type: '',
    provider: '',
    enabled: '',
    page: 1,
    limit: 20,
    sort: 'order_by:asc',
    showForm: false,
  } as const;

  if (!data) {
    return (
      <Main>
        <div className='max-w-5xl space-y-3'>
          <div className='bg-muted h-7 w-48 animate-pulse rounded' />
          <div className='bg-muted h-5 w-80 animate-pulse rounded' />
          <div className='bg-muted h-64 w-full animate-pulse rounded' />
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
            onClick={() => void nav({ to: '/quests', search: createQuestSearch() })}
          >
            Back to list
          </Button>
        </div>
        <QuestForm
          initial={
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            data ? apiToForm(data) : undefined
          }
          onSubmit={async (v: QuestFormValues) => {
            try {
              const questData = formToApi(v);
              const withSchedule: Partial<QuestWithDates> = {
                ...questData,
                started_at: v.start,
                completed_at: v.end,
              };
              await update.mutateAsync(withSchedule);
              toast.success('Quest saved successfully');
              void nav({ to: '/quests', search: listSearch });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Failed to save');
            }
          }}
          onCancel={() => void nav({ to: '/quests', search: createQuestSearch() })}
        />
      </Main>
    </>
  );
};

export const QuestCreateWithPresetPage = () => {
  const { preset } = useParams({ from: '/_authenticated/quests/new/$preset' });
  const create = useCreateQuest();
  const nav = useNavigate({});
  const listSearch = {
    search: '',
    group: 'all',
    type: '',
    provider: '',
    enabled: '',
    page: 1,
    limit: 20,
    sort: 'order_by:asc',
    showForm: false,
  } as const;

  // Get preset configuration
  const presetConfig = getPreset(preset as PresetId);

  return (
    <>
      <Main>
        <div className='mx-auto mb-4 flex max-w-5xl items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              New Quest - {presetConfig.name} {presetConfig.icon}
            </h2>
            <p className='text-muted-foreground'>{presetConfig.description}</p>
          </div>
          <Button
            variant='outline'
            onClick={() => void nav({ to: '/quests', search: createQuestSearch() })}
          >
            Back to list
          </Button>
        </div>
        <QuestForm
          presetConfig={presetConfig}
          onSubmit={async (v: QuestFormValues) => {
            try {
              const questData = formToApi(v);
              const withSchedule: Partial<QuestWithDates> = {
                ...questData,
                started_at: v.start,
                completed_at: v.end,
              };
              await create.mutateAsync(withSchedule);
              toast.success('Quest saved successfully');
              void nav({ to: '/quests', search: listSearch });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Failed to save');
            }
          }}
          onCancel={() => void nav({ to: '/quests', search: createQuestSearch() })}
        />
      </Main>
    </>
  );
};
