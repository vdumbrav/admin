import { api } from '@/lib/axios'
import type { Task } from '@/types/tasks'
import * as fx from '@/faker'

const useFake = import.meta.env.VITE_USE_FAKE_API === 'true'

export const listQuests = (params: any) =>
  useFake ? fx.getQuests(params) : api.get('/quests', { params }).then(r => r.data)

export const getQuest = (id: number) =>
  useFake ? fx.getQuest(id) : api.get(`/quests/${id}`).then(r => r.data)

export const createQuest = (payload: Partial<Task>) =>
  useFake ? fx.postQuest(payload) : api.post('/quests', payload).then(r => r.data)

export const updateQuest = (id: number, payload: Partial<Task>) =>
  useFake ? fx.patchQuest(id, payload) : api.patch(`/quests/${id}`, payload).then(r => r.data)

export const deleteQuest = (id: number) =>
  useFake ? fx.deleteQuest(id) : api.delete(`/quests/${id}`).then(r => r.data)

export const toggleVisibility = (id: number, visible: boolean) =>
  useFake ? fx.patchVisibility(id, visible) : api.patch(`/quests/${id}/visibility`, { visible }).then(r => r.data)

export const uploadMedia = (file: File) => {
  if (useFake) return fx.postMedia(file)
  const fd = new FormData()
  fd.append('file', file)
  return api.post(import.meta.env.VITE_UPLOAD_URL, fd).then(r => r.data)
}
