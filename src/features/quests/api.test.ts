import { postQuest, patchQuest, patchVisibility } from '@/faker'

it('creates and updates quest', async () => {
  const created = await postQuest({ title: 'Test', type: 'dummy', group: 'all', order_by: 0 })
  expect(created.title).toBe('Test')
  const updated = await patchQuest(created.id, { title: 'Updated' })
  expect(updated.title).toBe('Updated')
})

it('toggles visibility', async () => {
  const created = await postQuest({ title: 'Toggle', type: 'dummy', group: 'all', order_by: 0 })
  const toggled = await patchVisibility(created.id, false)
  expect(toggled.visible).toBe(false)
})
