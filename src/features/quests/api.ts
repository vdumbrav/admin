import api from '@/lib/axios'
import type { Task, TaskGroup } from '@/types/tasks'
import * as fakerApi from '@/faker/api'

const useFake = import.meta.env.VITE_USE_FAKE_API === 'true'

export type ListParams = {
  search?: string
  group?: TaskGroup | 'all'
  page?: number
  size?: number
  sort?: string
}

export type ListResponse = { items: Task[]; total: number }

export const listQuests = async (params: ListParams = {}): Promise<ListResponse> => {
  if (useFake) return fakerApi.getQuests(params)
  const res = await api.get<ListResponse>('/quests', { params })
  return res.data
}

export const getQuest = async (id: number): Promise<Task> => {
  if (useFake) return fakerApi.getQuest(id)
  const res = await api.get<Task>(`/quests/${id}`)
  return res.data
}

export const createQuest = async (payload: Task): Promise<Task> => {
  if (useFake) return fakerApi.postQuest(payload)
  const res = await api.post<Task>('/quests', payload)
  return res.data
}

export const updateQuest = async (id: number, payload: Partial<Task>): Promise<Task> => {
  if (useFake) return fakerApi.patchQuest(id, payload)
  const res = await api.patch<Task>(`/quests/${id}`, payload)
  return res.data
}

export const deleteQuest = async (id: number): Promise<void> => {
  if (useFake) {
    await fakerApi.deleteQuest(id)
    return
  }
  await api.delete(`/quests/${id}`)
}

export const toggleVisibility = async (id: number, visible: boolean): Promise<Task> => {
  if (useFake) return fakerApi.patchVisibility(id, visible)
  const res = await api.patch<Task>(`/quests/${id}/visibility`, { visible })
  return res.data
}

export const uploadMedia = async (file: File): Promise<{ url: string }> => {
  if (useFake) return fakerApi.postMedia(file)
  const fd = new FormData()
  fd.append('file', file)
  const res = await api.post<{ url: string }>(import.meta.env.VITE_UPLOAD_URL, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
