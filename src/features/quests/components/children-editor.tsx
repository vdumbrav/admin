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
import { NoWheelNumber } from '@/components/no-wheel-number';
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

const childTypes = types.filter((type) =>
  ['like', 'share', 'comment', 'join'].includes(type.value),
);

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

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium'>Child tasks</h3>
        <Button
          type='button'
          onClick={() => {
            append({
              title: '',
              type: 'like',
              group: 'social',
              provider: 'twitter',
              order_by: fields.length,
              uri: '',
            });
          }}
        >
          Add
        </Button>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div ref={listRef} className='space-y-4'>
            {fields.map((field, index) => (
              <ChildRow key={field.id} id={field.id} index={index} remove={remove} />
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
}

const ChildRow = ({ id, index, remove }: RowProps) => {
  const { control } = useFormContext<FormValues>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const type = useWatch({ control, name: `child.${index}.type` });
  const childProvider = useWatch({ control, name: `child.${index}.provider` });
  const parentProvider = useWatch({ control, name: 'provider' });

  // Child inherits provider from parent if not explicitly set
  const provider = childProvider ?? parentProvider;
  const showTweetFields = ['like', 'share', 'comment'].includes(type) && provider === 'twitter';

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
              <FormLabel>Reward, XP</FormLabel>
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

      {/* Task Image Upload */}
      <TaskImageUpload index={index} />

      {/* URI Field for Twitter provider */}
      {provider === 'twitter' && (
        <FormField
          control={control}
          name={`child.${index}.uri`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URI (URL)</FormLabel>
              <FormControl>
                <Input {...field} placeholder='Enter URI/URL' />
              </FormControl>
              <FormDescription>Required for Twitter tasks</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showTweetFields && (
        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={control}
            name={`child.${index}.resources.tweetId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tweet URL or ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='1234567890'
                    onBlur={(e) => field.onChange((e.target.value || '').trim())}
                  />
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
                <FormLabel>Twitter Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Enter username (e.g. waitlist)'
                    onBlur={(e) => field.onChange((e.target.value || '').trim().replace(/^@/, ''))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

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
      <h4 className='mb-2 text-sm font-medium'>Twitter Card Preview:</h4>
      <TwitterPreview username={username} tweetId={tweetId} />
    </div>
  );
};
