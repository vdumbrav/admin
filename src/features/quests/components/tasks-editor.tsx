import { useEffect, useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NoWheelNumber } from '@/components/no-wheel-number';
import { SelectDropdown } from '@/components/select-dropdown';
import type { Task } from '../data/types';

// Ограничиваем типы для Action with post
type TaskType = Extract<Task['type'], 'like' | 'share' | 'comment'>;

interface TaskItem {
  title: string;
  type: TaskType;
  provider?: Task['provider'];
  reward?: number;
  order_by: number;
  resources?: { tweetId?: string; username?: string };
}

interface FormValues {
  tasks: TaskItem[];
  totalReward?: number;
}

const taskTypes = [
  { value: 'like', label: 'Like' },
  { value: 'share', label: 'Share' },
  { value: 'comment', label: 'Comment' },
];

const taskProviders = [
  { value: 'twitter', label: 'Twitter' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
];

export const TasksEditor = () => {
  const { control, setValue } = useFormContext<FormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'tasks',
  });
  const listRef = useRef<HTMLDivElement>(null);

  // Watch tasks for totalReward calculation
  const tasks = useWatch({ control, name: 'tasks' });

  // Auto-recalculate order_by when fields change
  useEffect(() => {
    fields.forEach((_f, i) => {
      setValue(`tasks.${i}.order_by`, i, { shouldDirty: true });
    });
  }, [fields, setValue]);

  // Auto-recalculate totalReward when tasks change
  useEffect(() => {
    if (tasks && Array.isArray(tasks)) {
      const total = tasks.reduce((sum, task) => {
        const reward = task?.reward || 0;
        return sum + (typeof reward === 'number' && reward >= 0 ? reward : 0);
      }, 0);

      // Update totalReward field (readonly in form)
      (setValue as any)('totalReward', total, { shouldDirty: false });
    }
  }, [tasks, setValue]);

  // Scroll to new item
  useEffect(() => {
    const el = listRef.current?.lastElementChild;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [fields.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    move(oldIndex, newIndex);
  };

  const canAddMore = fields.length < 10;
  const needsMinimum = fields.length === 0;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium'>Tasks</h3>
          <p className='text-xs text-muted-foreground'>
            {fields.length}/10 tasks • Min: 1, Max: 10
          </p>
        </div>
        <Button
          type='button'
          onClick={() =>
            append({
              title: '',
              type: 'like',
              provider: 'twitter',
              order_by: fields.length,
              reward: 10,
            })
          }
          disabled={!canAddMore}
        >
          Add Task
        </Button>
      </div>

      {needsMinimum && (
        <div className='rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800'>
          At least 1 task is required for Action with post preset.
        </div>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div ref={listRef} className='space-y-4'>
            {fields.map((field, index) => (
              <TaskRow
                key={field.id}
                id={field.id}
                index={index}
                remove={remove}
                canRemove={fields.length > 1} // Prevent removing if only 1 left
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

interface RowProps {
  id: string;
  index: number;
  remove: (index: number) => void;
  canRemove: boolean;
}

const TaskRow = ({ id, index, remove, canRemove }: RowProps) => {
  const { control } = useFormContext<FormValues>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const type = useWatch({ control, name: `tasks.${index}.type` });
  const provider = useWatch({ control, name: `tasks.${index}.provider` });
  const showTweetFields = ['like', 'share', 'comment'].includes(type) && provider === 'twitter';

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging}
      className='space-y-2 rounded-md border p-4 transition-shadow data-[dragging=true]:shadow-lg'
    >
      <div className='flex justify-between'>
        <div className='flex items-center gap-2'>
          <span {...attributes} {...listeners} className='cursor-move text-muted-foreground'>
            ⋮⋮
          </span>
          <span className='text-xs text-muted-foreground'>#{index + 1}</span>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => remove(index)}
          disabled={!canRemove}
          aria-label='Remove task'
        >
          Remove
        </Button>
      </div>

      <FormField
        control={control}
        name={`tasks.${index}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} placeholder='Enter task title' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid gap-4 sm:grid-cols-3'>
        <FormField
          control={control}
          name={`tasks.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <SelectDropdown
                value={field.value}
                onValueChange={field.onChange}
                placeholder='Select type'
                items={taskTypes}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`tasks.${index}.provider`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <SelectDropdown
                value={field.value}
                onValueChange={field.onChange}
                placeholder='Select provider'
                items={taskProviders}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`tasks.${index}.reward`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward</FormLabel>
              <FormControl>
                <NoWheelNumber
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      Number.isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber,
                    )
                  }
                  min={0}
                  step={1}
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
            name={`tasks.${index}.resources.tweetId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tweet ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='1234567890'
                    onBlur={(e) => field.onChange((e.target.value ?? '').trim())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`tasks.${index}.resources.username`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='waitlist'
                    onBlur={(e) => field.onChange((e.target.value ?? '').trim().replace(/^@/, ''))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export type { TaskItem };