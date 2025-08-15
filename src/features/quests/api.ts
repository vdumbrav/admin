/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Task, TaskGroup } from '@/types/tasks'

const FAKE = import.meta.env.VITE_USE_FAKE_API === 'true'
const fx = FAKE ? await import('@/faker') : null

export function useQuests(params: { search?: string; group?: TaskGroup | 'all'; page?: number; size?: number; sort?: string }) {
  return useQuery({
    queryKey: ['quests', params],
    queryFn: async () => (FAKE ? fx!.getQuests(params) : (await api.get('/admin/quests', { params })).data),
  })
}

export function useQuest(id: number) {
  return useQuery({
    queryKey: ['quest', id],
    queryFn: async () => (FAKE ? fx!.getQuest(id) : (await api.get(`/admin/quests/${id}`)).data),
    enabled: !!id,
  })
}

export function useCreateQuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Task>) =>
      FAKE ? fx!.postQuest(payload) : (await api.post('/admin/quests', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useUpdateQuest(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Task>) =>
      FAKE ? fx!.patchQuest(id, payload) : (await api.patch(`/admin/quests/${id}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quests'] })
      qc.invalidateQueries({ queryKey: ['quest', id] })
    },
  })
}

export function useDeleteQuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      if (FAKE) return fx!.deleteQuest(id)
      return api.delete(`/admin/quests/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useToggleVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, visible }: { id: number; visible: boolean }) =>
      FAKE
        ? fx!.patchVisibility(id, visible)
        : (await api.patch(`/admin/quests/${id}/visibility`, { visible })).data,
    onMutate: async ({ id, visible }) => {
      await qc.cancelQueries({ queryKey: ['quests'] })
      const prev = qc.getQueryData<any>(['quests'])
      qc.setQueryData<any>(['quests'], (d: any) => ({
        ...d,
        items: d.items.map((t: Task) => (t.id === id ? { ...t, visible } : t)),
      }))
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(['quests'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export async function uploadMedia(file: File) {
  if (FAKE) return fx!.postMedia(file)
  const fd = new FormData()
  fd.append('file', file)
  const res = await api.post('/admin/media', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data as { url: string }
}
