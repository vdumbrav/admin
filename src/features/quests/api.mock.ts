import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task, TaskGroup } from '@/types/tasks'
import * as fx from '@/faker'

type QuestsResponse = { items: Task[]; total: number }

export function useQuests(params: { search?: string; group?: TaskGroup | 'all'; page?: number; size?: number; sort?: string }) {
  return useQuery<QuestsResponse>({
    queryKey: ['quests', params],
    queryFn: () => fx.getQuests(params),
  })
}

export function useQuest(id: number) {
  return useQuery<Task>({
    queryKey: ['quest', id],
    queryFn: () => fx.getQuest(id),
    enabled: !!id,
  })
}

export function useCreateQuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task>) => fx.postQuest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useUpdateQuest(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task>) => fx.patchQuest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quests'] })
      qc.invalidateQueries({ queryKey: ['quest', id] })
    },
  })
}

export function useDeleteQuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => fx.deleteQuest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useToggleVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) => fx.patchVisibility(id, visible),
    onMutate: async ({ id, visible }) => {
      await qc.cancelQueries({ queryKey: ['quests'] })
      const prev = qc.getQueryData<QuestsResponse>(['quests'])
      qc.setQueryData<QuestsResponse>(['quests'], (d) =>
        d ? { ...d, items: d.items.map((t: Task) => (t.id === id ? { ...t, visible } : t)) } : d,
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(['quests'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export async function uploadMedia(file: File) {
  return fx.postMedia(file)
}
