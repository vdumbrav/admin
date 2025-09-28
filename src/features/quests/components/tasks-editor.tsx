import { useEffect, useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { IconGripVertical } from '@tabler/icons-react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NoWheelNumber } from '@/components/no-wheel-number';
import { SelectDropdown } from '@/components/select-dropdown';
import { uploadMedia } from '../api';
import type { Quest } from '../data/types';
import { IconUpload as ImageUpload } from './icon-upload';
import { TwitterPreview } from './twitter-preview';

// Ограничиваем типы для Action with post
type TaskType = Extract<Quest['type'], 'like' | 'share' | 'comment'>;

interface TaskItem {
  title: string;
  description?: string;
  type: TaskType;
  reward: number;
  order_by: number;
  uri: string;
  resources?: {
    username?: string;
    tweetId?: string;
    ui?: {
      'pop-up'?: {
        static?: string;
      };
    };
  };
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
  const { control, setValue, watch } = useFormContext(); // Remove type assertion to let TS infer from usage
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'child',
  });

  // Get provider from parent form to inherit in child tasks
  const parentProvider = watch('provider');

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
  }, [fields, setValue]);

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
              description: '',
              type: 'like',
              group: 'social',
              order_by: fields.length,
              reward: 0,
              provider: parentProvider, // Inherit provider from parent
              uri: '',
              resources: {
                username: '',
                tweetId: '',
                ui: {
                  'pop-up': {
                    static: '',
                  },
                },
              },
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
      className='space-y-4 rounded-md border p-4 transition-shadow data-[dragging=true]:shadow-lg'
    >
      <div className='flex justify-between'>
        <div className='flex items-center gap-2'>
          <span
            {...attributes}
            {...listeners}
            className='text-muted-foreground cursor-move select-none'
          >
            <IconGripVertical size={16} />
          </span>
          <span className='text-muted-foreground text-xs'># Task {index + 1}</span>
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

      <FormField
        control={control}
        name={`child.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder='Enter task description' rows={2} />
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
                className='w-full'
                value={field.value as string}
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
              <FormLabel>Reward, XP</FormLabel>
              <FormControl>
                <NoWheelNumber
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(
                      Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber,
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

      {/* URI Field for Twitter tasks */}
      <FormField
        control={control}
        name={`child.${index}.uri`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tweet URL</FormLabel>
            <FormControl>
              <Input {...field} placeholder='Enter Tweet URL' />
            </FormControl>
            <FormDescription>Required for Twitter tasks</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Task Image Upload */}
      <TaskImageUpload index={index} />

      {/* Optional Twitter fields */}
      <div className='grid gap-4 sm:grid-cols-2'>
        <FormField
          control={control}
          name={`child.${index}.resources.username`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter Username (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder='Enter username (without @)' />
              </FormControl>
              <FormDescription>Optional: For Twitter card display</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`child.${index}.resources.tweetId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tweet URL or ID (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='Tweet ID or URL'
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    // Extract ID from URL if provided
                    const urlMatch = /status\/(\d{19,20})/.exec(raw);
                    const digits = raw.replace(/\D/g, '');
                    const id = urlMatch?.[1] ?? digits;
                    field.onChange(id);
                  }}
                />
              </FormControl>
              <FormDescription>Optional: For Twitter card display</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Twitter Preview for this child task */}
      <ChildTwitterPreview index={index} />
    </div>
  );
};

// Task Image Upload Component
const TaskImageUpload = ({ index }: { index: number }) => {
  const { control, setValue } = useFormContext();
  const image = useWatch({ control, name: `child.${index}.resources.ui.pop-up.static` });

  return (
    <div>
      <h4 className='mb-2 text-sm font-medium'>Task Image</h4>
      <ImageUpload
        value={image}
        onChange={(url) =>
          setValue(`child.${index}.resources.ui.pop-up.static`, url, { shouldDirty: true })
        }
        onImageUpload={uploadMedia}
      />
    </div>
  );
};

// Child Task Preview Component - shows Twitter card preview
const ChildTwitterPreview = ({ index }: { index: number }) => {
  const { control } = useFormContext();
  const username = useWatch({ control, name: `child.${index}.resources.username` });
  const tweetId = useWatch({ control, name: `child.${index}.resources.tweetId` });

  // Check if we have twitter data to preview
  const hasTwitterData = !!(username && tweetId);

  if (!hasTwitterData) return null;

  return (
    <div className='mt-4'>
      <h4 className='mb-2 text-sm font-medium'>Twitter Card Preview:</h4>
      <TwitterPreview username={username} tweetId={tweetId} />
    </div>
  );
};

export type { TaskItem };
