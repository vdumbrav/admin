/* eslint-disable @typescript-eslint/no-explicit-any */
import data from './quests.fixture.json'
import type { Task } from '@/types/tasks'

let seq = 100000
let items: Task[] = (data as Task[]).map(t => ({ visible: true, ...t }))

export function list({ search = '', group = 'all', page = 1, size = 20, sort = 'order_by:asc' }) {
  let res = [...items]
  if (group && group !== 'all') res = res.filter(i => i.group === group)
  if (search) res = res.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
  const [f, dir] = sort.split(':')
  res.sort((a: any, b: any) => ((a[f] ?? '') > (b[f] ?? '') ? (dir === 'asc' ? 1 : -1) : (dir === 'asc' ? -1 : 1)))
  const total = res.length
  const start = (page - 1) * size
  return { items: res.slice(start, start + size), total }
}
export const get = (id: number) => items.find(i => i.id === id)
export function create(payload: Partial<Task>): Task {
  const t: Task = {
    id: ++seq,
    order_by: 0,
    group: 'all' as any,
    type: 'dummy' as any,
    title: '',
    description: null,
    ...payload,
    visible: payload.visible ?? true,
  }
  items = [t, ...items]
  return t
}
export function update(id: number, payload: Partial<Task>) {
  items = items.map(i => (i.id === id ? { ...i, ...payload } : i))
  return get(id)
}
export function remove(id: number) {
  items = items.filter(i => i.id !== id)
}
export function toggle(id: number, visible: boolean) {
  return update(id, { visible })
}
export function fakeUrl(name = 'image.png') {
  return `blob:/fake/${Date.now()}-${name}`
}
