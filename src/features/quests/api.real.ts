import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppAuth } from '@/auth/provider'
import type { Task, TaskGroup } from '@/types/tasks'
import { toast } from 'sonner'
import { http } from '@/lib/http'
import type { QuestPayload } from './types'

interface QuestsResponse {
  items: Task[]
  total: number
}

export const useQuests = (query: {
  search?: string
  group?: TaskGroup | 'all'
  type?: string
  provider?: string
  visible?: string
  page?: number
  limit?: number
  sort?: string
}) => {
  const params = {
    ...query,
    visible: query.visible === '' ? undefined : query.visible === 'true',
  }
  const { getAccessToken } = useAppAuth()
  const search = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    )
  ).toString()
  return useQuery<QuestsResponse>({
    queryKey: ['quests', search],
    queryFn: () =>
      http<QuestsResponse>(`/quests?${search}`, { token: getAccessToken() }),
    staleTime: 20_000,
    placeholderData: (prev) => prev,
  })
}

export const useQuest = (id: number) => {
  const { getAccessToken } = useAppAuth()
  return useQuery<Task>({
    queryKey: ['quest', id],
    queryFn: () => http<Task>(`/quests/${id}`, { token: getAccessToken() }),
    enabled: !!id,
  })
}

export const useCreateQuest = () => {
  const qc = useQueryClient()
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: (payload: QuestPayload) =>
      http<Task>('/quests', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: getAccessToken(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
    onError: (e: unknown) => toast.error(String(e)),
  })
}

export const useUpdateQuest = (id: number) => {
  const qc = useQueryClient()
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: (payload: QuestPayload) =>
      http<Task>(`/quests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        token: getAccessToken(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quests'] })
      qc.invalidateQueries({ queryKey: ['quest', id] })
    },
    onError: (e: unknown) => toast.error(String(e)),
  })
}

export const useDeleteQuest = () => {
  const qc = useQueryClient()
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: (id: number) =>
      http(`/quests/${id}`, { method: 'DELETE', token: getAccessToken() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quests'] }),
    onError: (e: unknown) => toast.error(String(e)),
  })
}

export const useToggleVisibility = () => {
  const qc = useQueryClient()
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      http<Task>(`/quests/${id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ visible }),
        token: getAccessToken(),
      }),
    onMutate: async ({ id, visible }) => {
      await qc.cancelQueries({ queryKey: ['quests'] })
      const prev = qc.getQueryData<QuestsResponse>(['quests'])
      qc.setQueryData<QuestsResponse>(['quests'], (d) =>
        d
          ? {
              ...d,
              items: d.items.map((t) => (t.id === id ? { ...t, visible } : t)),
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

export const useBulkAction = () => {
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
      http('/quests/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids, action }),
        token: getAccessToken(),
      }),
    onMutate: async ({ ids, action }) => {
      await qc.cancelQueries({ queryKey: ['quests'] })
      const prev = qc.getQueryData<QuestsResponse>(['quests'])
      qc.setQueryData<QuestsResponse>(['quests'], (d) => {
        if (!d) return d
        if (action === 'delete') {
          return { ...d, items: d.items.filter((i) => !ids.includes(i.id)) }
        }
        const visible = action === 'show'
        return {
          ...d,
          items: d.items.map((i) =>
            ids.includes(i.id) ? { ...i, visible } : i
          ),
        }
      })
      return { prev }
    },
    onError: (e: unknown, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['quests'], ctx.prev)
      toast.error(String(e))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quests'] })
      toast.success('Bulk action applied')
    },
  })
}

export const uploadMedia = (file: File, token: string | undefined) => {
  const fd = new FormData()
  fd.append('file', file)
  return http<{ url: string }>(`/media`, {
    method: 'POST',
    body: fd,
    token,
  })
}

export const useReorderQuests = () => {
  const qc = useQueryClient()
  const { getAccessToken } = useAppAuth()
  return useMutation({
    mutationFn: ({ rows }: { rows: Array<{ id: number; order_by: number }> }) =>
      http<{ ok: boolean }>(`/quests/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ rows }),
        token: getAccessToken(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quests'] })
      toast.success('Order saved')
    },
    onError: (e: unknown) => toast.error(String(e)),
  })
}
