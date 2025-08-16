import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task, TaskGroup } from '@/types/tasks'

type QuestsResponse = { items: Task[]; total: number }

const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) throw new Error('Request failed')
  return res.json() as Promise<T>
}

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
    queryFn: () =>
      request<QuestsResponse>(
        `/admin/quests?${new URLSearchParams({
          search: params.search ?? '',
          group: params.group ?? '',
          type: params.type ?? '',
          provider: params.provider ?? '',
          visible: params.visible === undefined ? '' : String(params.visible),
          page: String(params.page ?? 1),
          limit: String(params.limit ?? 20),
          sort: params.sort ?? 'order_by:asc',
        })}`
      ),
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
    mutationFn: (id: number) =>
      request<unknown>(`/admin/quests/${id}`, { method: 'DELETE' }),
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
    }) =>
      request<unknown>(`/admin/quests/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      }),
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
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${BASE_URL}/admin/media`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) throw new Error('Request failed')
  return (await res.json()) as { url: string }
}
