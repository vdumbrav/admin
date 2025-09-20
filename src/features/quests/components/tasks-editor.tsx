import { useEffect, useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
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
  reward?: number;
  order_by: number;
}

interface FormValues {
  child: TaskItem[];
  totalReward?: number;
}

const taskTypes = [
  { value: 'like', label: 'Like' },
  { value: 'share', label: 'Share' },
  { value: 'comment', label: 'Comment' },
];

// Provider is readonly for action-with-post preset

export const TasksEditor = () => {
  const { control, setValue } = useFormContext<FormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'child',
  });
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-recalculate order_by when fields change (debounced to avoid excessive updates)
  useEffect(() => {
    if (fields.length === 0) return;

    const timeoutId = setTimeout(() => {
      fields.forEach((_f, i) => {
        setValue(`child.${i}.order_by`, i, { shouldDirty: true });
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [fields.length, setValue]);

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
          <p className='text-muted-foreground text-xs'>
            {fields.length}/10 tasks • Min: 1, Max: 10
          </p>
        </div>
        <Button
          type='button'
          onClick={() =>
            append({
              title: '',
              type: 'like',
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
  // All tasks in action-with-post are twitter tasks, twitter fields are global

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging}
      className='space-y-2 rounded-md border p-4 transition-shadow data-[dragging=true]:shadow-lg'
    >
      <div className='flex justify-between'>
        <div className='flex items-center gap-2'>
          <span {...attributes} {...listeners} className='text-muted-foreground cursor-move'>
            ⋮⋮
          </span>
          <span className='text-muted-foreground text-xs'>#{index + 1}</span>
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
        name={`child.${index}.title`}
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

      <div className='grid gap-4 sm:grid-cols-2'>
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
                items={taskTypes}
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

      {/* Twitter fields are global for action-with-post preset */}
    </div>
  );
};

export type { TaskItem };
