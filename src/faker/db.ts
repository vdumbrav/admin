/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Task } from '@/types/tasks'
import data from './quests.fixture.json'

let seq = 100000
let items: Task[] = (data as Task[]).map((t) => ({ visible: true, ...t }))

export function list({
  search = '',
  group = 'all',
  type = '',
  provider = '',
  visible = '',
  page = 1,
  limit = 20,
  sort = 'order_by:asc',
}) {
  let res = [...items]
  if (group && group !== 'all') res = res.filter((i) => i.group === group)
  if (type) res = res.filter((i) => i.type === type)
  if (provider) res = res.filter((i) => i.provider === provider)
  if (visible) res = res.filter((i) => String(i.visible ?? true) === visible)
  if (search) {
    const s = search.toLowerCase()
    res = res.filter((i) =>
      [
        i.title,
        i.provider,
        i.resources?.username,
        i.resources?.tweetId,
        i.resources?.username,
      ]
        .map((v) => (v ? String(v).toLowerCase() : ''))
        .some((v) => v.includes(s))
    )
  }
  const [f, dir] = sort.split(':')
  res.sort((a: any, b: any) =>
    (a[f] ?? '') > (b[f] ?? '')
      ? dir === 'asc'
        ? 1
        : -1
      : dir === 'asc'
        ? -1
        : 1
  )
  const total = res.length
  const start = (page - 1) * limit
  return { items: res.slice(start, start + limit), total }
}
export const get = (id: number) => items.find((i) => i.id === id)
export function create(payload: Partial<Task>): Task {
  const t: Task = {
    id: ++seq,
    order_by: 0,
    group: 'all',
    type: 'dummy',
    title: '',
    description: null,
    ...payload,
    visible: payload.visible ?? true,
  }
  items = [t, ...items]
  return t
}
export function update(id: number, payload: Partial<Task>) {
  items = items.map((i) => (i.id === id ? { ...i, ...payload } : i))
  return get(id)
}
export function remove(id: number) {
  items = items.filter((i) => i.id !== id)
}
export function toggle(id: number, visible: boolean) {
  return update(id, { visible })
}
export function fakeUrl(name = 'image.png') {
  return `blob:/fake/${Date.now()}-${name}`
}
