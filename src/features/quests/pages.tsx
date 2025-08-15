import { useCreateQuest, useQuest, useUpdateQuest } from './api'
import { QuestForm } from './QuestForm'
import { useParams, useNavigate } from '@tanstack/react-router'
import { QuestsTable } from './QuestsTable'
import type { Task } from '@/types/tasks'

export function QuestsListPage() {
  return <QuestsTable />;
}

export function QuestCreatePage() {
  const create = useCreateQuest()
  const nav = useNavigate({})
  return (
      <QuestForm
        onSubmit={async (v: Partial<Task>) => {
          await create.mutateAsync(v)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nav({ to: '/quests' as any })
        }}
      />
  );
}

export function QuestEditPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = useParams({ from: '/quests/$id' as any })
  const id = Number(params.id)
  const { data } = useQuest(id)
  const update = useUpdateQuest(id)
  const nav = useNavigate({})

  if (!data) return null;
  return (
      <QuestForm
        initial={data}
        onSubmit={async (v: Partial<Task>) => {
          await update.mutateAsync(v)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nav({ to: '/quests' as any })
        }}
      />
  );
}
