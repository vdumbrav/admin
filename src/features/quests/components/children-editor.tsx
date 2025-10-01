import { useEffect, useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { IconGripVertical } from '@tabler/icons-react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
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
import { NumberInput } from '@/components/number-input';
import { SelectDropdown } from '@/components/select-dropdown';
import { uploadMedia } from '../api';
import { providers, types } from '../data/data';
import type { ChildFormValues } from '../types/form-types';
import { IconUpload as ImageUpload } from './icon-upload';
import { TwitterPreview } from './twitter-preview';

interface FormValues {
  child: ChildFormValues[];
  provider?: string;
}

const childTypes = types.filter((type) => ['like', 'share', 'comment'].includes(type.value));

const childProviders = providers;

export const ChildrenEditor = () => {
  const { control, setValue } = useFormContext<FormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'child',
  });
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fields.forEach((_f, i) => {
      setValue(`child.${i}.order_by`, i, { shouldDirty: true });
    });
  }, [fields, setValue]);

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
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-medium'>Child tasks</h3>
          <span
            className={cn('rounded-full px-2 py-1 text-xs', {
              'bg-destructive/10 text-destructive': fields.length > 10,
              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300':
                fields.length > 8 && fields.length <= 10,
              'bg-muted text-muted-foreground': fields.length <= 8,
            })}
          >
            {fields.length}/10
          </span>
        </div>
        <Button
          type='button'
          disabled={!canAddMore}
          onClick={() => {
            append({
              title: '',
              description: '',
              type: 'like',
              group: 'social',
              provider: 'twitter',
              order_by: fields.length,
              reward: 0,
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
            });
          }}
        >
          Add Task
        </Button>
      </div>

      {needsMinimum && (
        <div className='rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300'>
          At least 1 task is required for multiple type quests.
        </div>
      )}
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div ref={listRef} className='space-y-4'>
            {fields.map((field, index) => (
              <ChildRow
                key={field.id}
                id={field.id}
                index={index}
                remove={remove}
                canRemove={fields.length > 1}
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

const ChildRow = ({ id, index, remove, canRemove }: RowProps) => {
  const { control, setValue } = useFormContext<FormValues>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const childProvider = useWatch({ control, name: `child.${index}.provider` });
  const parentProvider = useWatch({ control, name: 'provider' });

  // Child inherits provider from parent if not explicitly set
  const provider = childProvider ?? parentProvider;
  const showProviderField = !parentProvider; // Hide if inherited from parent

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging}
      className='space-y-4 rounded-md border p-4 transition-shadow data-[dragging=true]:shadow-lg'
    >
      <div className='flex justify-between'>
        <span
          {...attributes}
          {...listeners}
          className='text-muted-foreground cursor-move select-none'
        >
          <IconGripVertical size={16} />
        </span>
        <Button
          type='button'
          variant='outline'
          onClick={() => remove(index)}
          disabled={!canRemove}
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

      <FormField
        control={control}
        name={`child.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder='Enter description' rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className={cn('grid gap-4', showProviderField ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        <FormField
          control={control}
          name={`child.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <SelectDropdown
                className='w-full'
                value={field.value}
                onValueChange={field.onChange}
                placeholder='Select type'
                items={childTypes}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        {showProviderField && (
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
        )}
        <FormField
          control={control}
          name={`child.${index}.reward`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward, XP</FormLabel>
              <FormControl>
                <NumberInput value={field.value} onChange={field.onChange} min={0} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Task Image Upload */}
      <TaskImageUpload index={index} />

      {/* URL Field for Twitter provider */}
      {provider === 'twitter' && (
        <FormField
          control={control}
          name={`child.${index}.uri`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='https://twitter.com/user/status/123456789'
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    field.onChange(url);

                    // Parse tweet URL to extract username and tweetId
                    const tweetUrlMatch =
                      /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d{19,20})/.exec(
                        url,
                      );
                    if (tweetUrlMatch) {
                      const [, username, tweetId] = tweetUrlMatch;
                      setValue(`child.${index}.resources.username`, username, {
                        shouldDirty: true,
                      });
                      setValue(`child.${index}.resources.tweetId`, tweetId, { shouldDirty: true });
                    }
                  }}
                />
              </FormControl>
              <FormDescription>Tweet URL - username and ID auto-extracted</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Tweet URL or ID field - hidden (data still available in form state) */}

      {/* Preview Component */}
      <ChildPreview index={index} />
    </div>
  );
};

// Task Image Upload Component
const TaskImageUpload = ({ index }: { index: number }) => {
  const { control, setValue } = useFormContext<FormValues>();
  const image = useWatch({ control, name: `child.${index}.resources.ui.pop-up.static` });

  return (
    <div>
      <h4 className='mb-2 text-sm font-medium'>Task Image</h4>
      <ImageUpload
        value={image}
        onChange={(url) =>
          setValue(`child.${index}.resources.ui.pop-up.static`, url, { shouldDirty: true })
        }
        onClear={() => setValue(`child.${index}.resources.ui.pop-up.static`, '', { shouldDirty: true })}
        onImageUpload={uploadMedia}
      />
    </div>
  );
};

// Child Preview Component - shows Twitter card preview
const ChildPreview = ({ index }: { index: number }) => {
  const { control } = useFormContext<FormValues>();
  const username = useWatch({ control, name: `child.${index}.resources.username` });
  const tweetId = useWatch({ control, name: `child.${index}.resources.tweetId` });

  // Check if we have twitter data to preview
  const hasTwitterData = !!(username && tweetId);

  if (!hasTwitterData) return null;

  return (
    <div className='mt-4'>
      <TwitterPreview username={username} tweetId={tweetId} />
    </div>
  );
};
