/* eslint-disable @typescript-eslint/no-explicit-any */
import * as db from './db'
import { delay } from './delay'

export async function getQuests(p: any) {
  await delay()
  return db.list(p)
}
export async function getQuest(id: number) {
  await delay()
  return db.get(id)!
}
export async function postQuest(p: any) {
  await delay()
  return db.create(p)
}
export async function patchQuest(id: number, p: any) {
  await delay()
  return db.update(id, p)!
}
export async function deleteQuest(id: number) {
  await delay()
  return db.remove(id)
}
export async function patchVisibility(id: number, visible: boolean) {
  await delay()
  return db.toggle(id, visible)!
}
export async function postMedia(file: File) {
  await delay()
  return { url: db.fakeUrl(file.name) }
}

export async function reorderQuests(
  rows: Array<{ id: number; order_by: number }>
) {
  await delay()
  return db.reorder(rows)
}
