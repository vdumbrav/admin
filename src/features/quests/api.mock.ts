import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as fx from '@/faker'
import type { Task, TaskGroup } from '@/types/tasks'
import type { QuestPayload } from './types'

type QuestsResponse = { items: Task[]; total: number }

export function useQuests(query: {
  search?: string
  group?: TaskGroup | 'all'
  type?: string
  provider?: string
  visible?: string
  page?: number
  limit?: number
  sort?: string
}) {
  const params = {
    ...query,
    visible: query.visible === '' ? undefined : query.visible === 'true',
  }
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
    mutationFn: (payload: QuestPayload) => fx.postQuest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useUpdateQuest(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: QuestPayload) => fx.patchQuest(id, payload),
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
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      fx.patchVisibility(id, visible),
    onMutate: async ({ id, visible }) => {
      await qc.cancelQueries({ queryKey: ['quests'] })
      const prev = qc.getQueryData<QuestsResponse>(['quests'])
      qc.setQueryData<QuestsResponse>(['quests'], (d) =>
        d
          ? {
              ...d,
              items: d.items.map((t: Task) =>
                t.id === id ? { ...t, visible } : t
              ),
            }
          : d
      )
      return { prev }
    },
    onError: (_e, _v, ctx) =>
      ctx?.prev && qc.setQueryData(['quests'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useBulkAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      ids,
      action,
    }: {
      ids: number[]
      action: 'hide' | 'show' | 'delete'
    }) => fx.bulkAction(ids, action),
    onMutate: async ({ ids, action }) => {
      await qc.cancelQueries({ queryKey: ['quests'] })
      const prev = qc.getQueryData<QuestsResponse>(['quests'])
      qc.setQueryData<QuestsResponse>(['quests'], (d) => {
        if (!d) return d
        if (action === 'delete') {
          return { ...d, items: d.items.filter((i) => !ids.includes(i.id)) }
        }
        const v = action === 'show'
        return {
          ...d,
          items: d.items.map((i) =>
            ids.includes(i.id) ? { ...i, visible: v } : i
          ),
        }
      })
      return { prev }
    },
    onError: (_e, _v, ctx) =>
      ctx?.prev && qc.setQueryData(['quests'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export async function uploadMedia(file: File) {
  return fx.postMedia(file)
}

export function useReorderQuests() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      rows,
    }: {
      rows: Array<{ id: number; order_by: number }>
    }) => fx.reorderQuests(rows),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}
