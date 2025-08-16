import { useParams, useNavigate } from '@tanstack/react-router'
import type { Task } from '@/types/tasks'
import { QuestForm } from './QuestForm'
import { useCreateQuest, useQuest, useUpdateQuest } from './api'

export const QuestCreatePage = () => {
  const create = useCreateQuest()
  const nav = useNavigate({})
  return (
    <QuestForm
      onSubmit={async (v: Partial<Task>) => {
        await create.mutateAsync(v)
        nav({ to: '/quests' })
      }}
    />
  )
}

export const QuestEditPage = () => {
  const params = useParams({ from: '/_authenticated/quests/$id' })
  const id = Number(params.id)
  const { data } = useQuest(id)
  const update = useUpdateQuest(id)
  const nav = useNavigate({})

  if (!data) return null
  return (
    <QuestForm
      initial={data}
      onSubmit={async (v: Partial<Task>) => {
        await update.mutateAsync(v)
        nav({ to: '/quests' })
      }}
    />
  )
}
