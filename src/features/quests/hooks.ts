import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task } from '@/types/tasks'
import {
  listQuests,
  getQuest,
  createQuest,
  updateQuest,
  deleteQuest,
  toggleVisibility,
} from './api'

type QuestsResponse = { items: Task[]; total: number }

export const useQuests = (params: any) =>
  useQuery<QuestsResponse>({ queryKey: ['quests', params], queryFn: () => listQuests(params) })

export const useQuest = (id: number) =>
  useQuery<Task>({ queryKey: ['quest', id], queryFn: () => getQuest(id), enabled: !!id })

export const useCreateQuest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task>) => createQuest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export const useUpdateQuest = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task>) => updateQuest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quests'] })
      qc.invalidateQueries({ queryKey: ['quest', id] })
    },
  })
}

export const useDeleteQuest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteQuest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export const useToggleVisibility = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      toggleVisibility(id, visible),
    onMutate: async ({ id, visible }) => {
      await qc.cancelQueries({ queryKey: ['quests'] })
      const prev = qc.getQueryData<QuestsResponse>(['quests'])
      qc.setQueryData<QuestsResponse>(['quests'], d =>
        d ? { ...d, items: d.items.map(t => (t.id === id ? { ...t, visible } : t)) } : d,
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(['quests'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}
