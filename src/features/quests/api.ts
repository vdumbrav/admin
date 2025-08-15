import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task, TaskGroup } from '@/types/tasks'

type QuestsResponse = { items: Task[]; total: number }

const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) throw new Error('Request failed')
  return res.json() as Promise<T>
}

export function useQuests(params: { search?: string; group?: TaskGroup | 'all'; page?: number; size?: number; sort?: string }) {
  return useQuery<QuestsResponse>({
    queryKey: ['quests', params],
    queryFn: () =>
      request<QuestsResponse>(`/admin/quests?${new URLSearchParams({
        search: params.search ?? '',
        group: params.group ?? '',
        page: String(params.page ?? 1),
        size: String(params.size ?? 20),
        sort: params.sort ?? 'order_by:asc',
      })}`),
  })
}

export function useQuest(id: number) {
  return useQuery<Task>({
    queryKey: ['quest', id],
    queryFn: () => request<Task>(`/admin/quests/${id}`),
    enabled: !!id,
  })
}

export function useCreateQuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task>) =>
      request<Task>('/admin/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useUpdateQuest(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task>) =>
      request<Task>(`/admin/quests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quests'] })
      qc.invalidateQueries({ queryKey: ['quest', id] })
    },
  })
}

export function useDeleteQuest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => request<unknown>(`/admin/quests/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useToggleVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      request<Task>(`/admin/quests/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible }),
      }),
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
  const res = await fetch(`${BASE_URL}/admin/media`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) throw new Error('Request failed')
  return (await res.json()) as { url: string }
}
