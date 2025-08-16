import { useEffect, useRef } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import type { Task } from '@/types/tasks'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'

interface Child {
  title: string
  type: 'like' | 'share' | 'comment' | 'join' | 'connect'
  provider?: Task['provider']
  reward?: number
  order_by: number
  resources?: { tweetId?: string; username?: string }
}

interface FormValues {
  child: Child[]
}

const childTypes = [
  { value: 'like', label: 'Like' },
  { value: 'share', label: 'Share' },
  { value: 'comment', label: 'Comment' },
  { value: 'join', label: 'Join' },
  { value: 'connect', label: 'Connect' },
]

const childProviders = [
  { value: 'twitter', label: 'Twitter' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'walme', label: 'Walme' },
  { value: 'monetag', label: 'Monetag' },
  { value: 'adsgram', label: 'AdsGram' },
]

export const ChildrenEditor = () => {
  const { control, setValue } = useFormContext<FormValues>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'child',
  })
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fields.forEach((_f, i) => {
      setValue(`child.${i}.order_by`, i, { shouldDirty: true })
    })
  }, [fields, setValue])

  useEffect(() => {
    const el = listRef.current?.lastElementChild
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [fields.length])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    move(oldIndex, newIndex)
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium'>Child tasks</h3>
        <Button
          type='button'
          onClick={() =>
            append({
              title: '',
              type: 'like',
              provider: 'twitter',
              order_by: fields.length,
            })
          }
        >
          Add
        </Button>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={listRef} className='space-y-4'>
            {fields.map((field, index) => (
              <ChildRow
                key={field.id}
                id={field.id}
                index={index}
                remove={remove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface RowProps {
  id: string
  index: number
  remove: (index: number) => void
}

const ChildRow = ({ id, index, remove }: RowProps) => {
  const { control } = useFormContext<FormValues>()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const type = useWatch({ control, name: `child.${index}.type` })
  const provider = useWatch({ control, name: `child.${index}.provider` })
  const showTweetFields =
    ['like', 'share', 'comment'].includes(type) && provider === 'twitter'

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging}
      className='space-y-2 rounded-md border p-4 transition-shadow data-[dragging=true]:shadow-lg'
    >
      <div className='flex justify-between'>
        <span {...attributes} {...listeners} className='cursor-move'>
          ::
        </span>
        <Button
          type='button'
          variant='outline'
          onClick={() => remove(index)}
          aria-label='Remove child'
        >
          Remove
        </Button>
      </div>
      <FormField
        control={control}
        name={`child.${index}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} placeholder='Enter title' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='grid gap-4 sm:grid-cols-3'>
        <FormField
          control={control}
          name={`child.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <SelectDropdown
                value={field.value}
                onValueChange={field.onChange}
                placeholder='Select type'
                items={childTypes}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`child.${index}.provider`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <SelectDropdown
                value={field.value}
                onValueChange={field.onChange}
                placeholder='Select provider'
                items={childProviders}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`child.${index}.reward`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        Number.isNaN(e.target.valueAsNumber)
                          ? undefined
                          : e.target.valueAsNumber
                      )
                    }
                  />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {showTweetFields && (
        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={control}
            name={`child.${index}.resources.tweetId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tweet ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`child.${index}.resources.username`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}

export type { Child }
