import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuests, useToggleVisibility, useDeleteQuest, useBulkAction } from './api'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import type { Task } from '@/types/tasks'

export function QuestsTable() {
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState<'all' | Task['group']>('all')
  const [type, setType] = useState('')
  const [provider, setProvider] = useState('')
  const [visible, setVisible] = useState('')
  const [sort, setSort] = useState('order_by:asc')
  const [page, setPage] = useState(1)
  const limit = 20
  const [selected, setSelected] = useState<number[]>([])

  const { user } = useAuth()
  const isAdmin = user?.roles.includes('admin')

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(rawSearch.trim())
      setPage(1)
    }, 250)
    return () => clearTimeout(id)
  }, [rawSearch])

  const changeFilter = <Value,>(setter: (v: Value) => void, value: Value) => {
    setter(value)
    setPage(1)
  }

  const allowedSort = new Set([
    'order_by:asc',
    'order_by:desc',
    'reward:asc',
    'reward:desc',
    'id:asc',
    'id:desc',
  ])
  const safeSort = allowedSort.has(sort) ? sort : 'order_by:asc'

  const { data, isLoading } = useQuests({
    search,
    group,
    type,
    provider,
    visible,
    page,
    limit,
    sort: safeSort,
  })
  const toggle = useToggleVisibility()
  const del = useDeleteQuest()
  const bulk = useBulkAction()

  if (isLoading) return <div>Loading…</div>

  const toggleSelect = (id: number, checked: boolean) => {
    setSelected(prev => (checked ? [...prev, id] : prev.filter(i => i !== id)))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          className="input"
          placeholder="Search"
          value={rawSearch}
          onChange={e => setRawSearch(e.target.value)}
        />
        <select
          className="input"
          value={group}
          onChange={e => changeFilter(setGroup, e.target.value as 'all' | Task['group'])}
        >
          <option value="all">all</option>
          <option value="social">social</option>
          <option value="daily">daily</option>
          <option value="referral">referral</option>
          <option value="partner">partner</option>
        </select>
        <select className="input" value={type} onChange={e => changeFilter(setType, e.target.value)}>
          <option value="">type</option>
          <option value="like">like</option>
          <option value="comment">comment</option>
          <option value="multiple">multiple</option>
          <option value="external">external</option>
        </select>
        <select className="input" value={provider} onChange={e => changeFilter(setProvider, e.target.value)}>
          <option value="">provider</option>
          <option value="twitter">twitter</option>
          <option value="telegram">telegram</option>
          <option value="discord">discord</option>
        </select>
        <select className="input" value={visible} onChange={e => changeFilter(setVisible, e.target.value)}>
          <option value="">visible</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
        <select className="input" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="order_by:asc">order asc</option>
          <option value="order_by:desc">order desc</option>
          <option value="reward:asc">reward asc</option>
          <option value="reward:desc">reward desc</option>
          <option value="id:asc">id asc</option>
          <option value="id:desc">id desc</option>
        </select>
      </div>

      {isAdmin && selected.length > 0 && (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { bulk.mutate({ ids: selected, action: 'hide' }); setSelected([]) }}>Hide</Button>
          <Button size="sm" onClick={() => { bulk.mutate({ ids: selected, action: 'show' }); setSelected([]) }}>Show</Button>
          <Button size="sm" variant="destructive" onClick={() => { bulk.mutate({ ids: selected, action: 'delete' }); setSelected([]) }}>Delete</Button>
        </div>
      )}

      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {isAdmin && (
              <th className="text-left">
                <input
                  type="checkbox"
                  checked={selected.length === (data?.items.length ?? 0) && (data?.items.length ?? 0) > 0}
                  onChange={e =>
                    setSelected(
                      e.target.checked ? (data?.items ?? []).map(i => i.id) : [],
                    )
                  }
                />
              </th>
            )}
            <th className="text-left">Title</th>
            <th className="text-left">Type</th>
            <th className="text-left">Group</th>
            <th className="text-left">Provider</th>
            <th className="text-left">Order</th>
            <th className="text-left">Visible</th>
            {isAdmin && <th className="text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {(data?.items ?? []).map((t: Task) => (
            <tr key={t.id} className="border-t">
              {isAdmin && (
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(t.id)}
                    onChange={e => toggleSelect(t.id, e.target.checked)}
                  />
                </td>
              )}
              <td>{t.title}</td>
              <td>{t.type}</td>
              <td>{t.group}</td>
              <td>{t.provider}</td>
              <td>{t.order_by}</td>
              <td>
                {isAdmin ? (
                  <Switch
                    checked={t.visible ?? true}
                    onCheckedChange={v => toggle.mutate({ id: t.id, visible: v })}
                  />
                ) : t.visible ? 'Yes' : 'No'}
              </td>
              {isAdmin && (
                <td>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link to="/quests/$id" params={{ id: String(t.id) }}>Edit</Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => del.mutate(t.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2 items-center">
        <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Prev
        </Button>
        <span>Page {page}</span>
        <Button
          size="sm"
          onClick={() => setPage(p => (data && p * limit < data.total ? p + 1 : p))}
          disabled={!(data && page * limit < data.total)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
