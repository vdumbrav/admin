import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppAuth } from '@/auth/provider'
import type { Task, TaskGroup } from '@/types/tasks'
import type { QuestPayload } from './types'

type QuestsResponse = { items: Task[]; total: number }

const BASE_URL = import.meta.env.VITE_API_URL as string

async function request<T>(
  path: string,
  token: string | undefined,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    // eslint-disable-next-line no-console
    console.error('Request failed', res.status, text)
    if (res.status === 401) {
      window.location.href = '/sign-in'
    }
    throw new Error(`Request failed with ${res.status}`)
  }
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
  const { getAccessToken } = useAppAuth()
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
        })}`,
        getAccessToken()
      ),
  })
}

export function useQuest(id: number) {
  const { getAccessToken } = useAppAuth()
  return useQuery<Task>({
    queryKey: ['quest', id],
    queryFn: () => request<Task>(`/admin/quests/${id}`, getAccessToken()),
    enabled: !!id,
  })
}

export function useCreateQuest() {
  const qc = useQueryClient()
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: (payload: QuestPayload) =>
      request<Task>('/admin/quests', getAccessToken(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useUpdateQuest(id: number) {
  const qc = useQueryClient()
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: (payload: QuestPayload) =>
      request<Task>(`/admin/quests/${id}`, getAccessToken(), {
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
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: (id: number) =>
      request<unknown>(`/admin/quests/${id}`, getAccessToken(), {
        method: 'DELETE',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}

export function useToggleVisibility() {
  const qc = useQueryClient()
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      request<Task>(`/admin/quests/${id}/visibility`, getAccessToken(), {
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
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: ({
      ids,
      action,
    }: {
      ids: number[]
      action: 'hide' | 'show' | 'delete'
    }) =>
      request<unknown>(`/admin/quests/bulk`, getAccessToken(), {
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

export async function uploadMedia(file: File, token: string | undefined) {
  const fd = new FormData()
  fd.append('file', file)
  return request<{ url: string }>(`/admin/media`, token, {
    method: 'POST',
    body: fd,
  })
}

export function useReorderQuests() {
  const qc = useQueryClient()
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: ({ rows }: { rows: Array<{ id: number; order_by: number }> }) =>
      request<{ ok: boolean }>(`/admin/quests/reorder`, getAccessToken(), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
  })
}
