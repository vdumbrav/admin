import { useQuests, useToggleVisibility, useDeleteQuest } from './api'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import type { Task } from '@/types/tasks'

export function QuestsTable() {
  const { data, isLoading } = useQuests({ page: 1, size: 50 })
  const toggle = useToggleVisibility()
  const del = useDeleteQuest()

  if (isLoading) return <div>Loading…</div>

  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          <th className="text-left">Title</th>
          <th className="text-left">Type</th>
          <th className="text-left">Group</th>
          <th className="text-left">Provider</th>
          <th className="text-left">Order</th>
          <th className="text-left">Visible</th>
          <th className="text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {(data?.items ?? []).map((t: Task) => (
          <tr key={t.id} className="border-t">
            <td>{t.title}</td>
            <td>{t.type}</td>
            <td>{t.group}</td>
            <td>{t.provider}</td>
            <td>{t.order_by}</td>
            <td>
              <Switch
                checked={t.visible ?? true}
                onCheckedChange={v => toggle.mutate({ id: t.id, visible: v })}
              />
            </td>
            <td>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="secondary">
                  <a href={`/quests/${t.id}`}>Edit</a>
                </Button>
                <Button size="sm" variant="destructive" onClick={() => del.mutate(t.id)}>
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
