import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task, TaskGroup } from '@/types/tasks'
import { api } from '@/lib/axios'

type QuestsResponse = { items: Task[]; total: number }

export function useQuests(params: { search?: string; group?: TaskGroup | 'all'; page?: number; size?: number; sort?: string }) {
  return useQuery<QuestsResponse>({
    queryKey: ['quests', params],
    queryFn: async () =>
      (
        await api.get<QuestsResponse>('/quests', {
          params: {
            search: params.search,
            group: params.group,
            page: params.page ?? 1,
            size: params.size ?? 20,
            sort: params.sort ?? 'order_by:asc',
          },
        })
      ).data,
  })
}

export function useQuest(id: number) {
  return useQuery<Task>({
    queryKey: ['quest', id],
    queryFn: async () => (await api.get<Task>(`/quests/${id}`)).data,
    enabled: !!id,
  })
}

export function useCreateQuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task>) => api.post<Task>('/quests', payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useUpdateQuest(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task>) => api.patch<Task>(`/quests/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quests'] })
      qc.invalidateQueries({ queryKey: ['quest', id] })
    },
  })
}

export function useDeleteQuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/quests/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useToggleVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      api.patch<Task>(`/quests/${id}/visibility`, { visible }).then(r => r.data),
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
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post<{ url: string }>(
    import.meta.env.VITE_UPLOAD_URL,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}
