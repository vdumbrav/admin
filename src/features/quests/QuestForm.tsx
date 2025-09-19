import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Spinner } from '@radix-ui/themes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBlocker } from '@tanstack/react-router';
import { useAppAuth } from '@/auth/hooks';
import { mediaErrors } from '@/errors/media';
import { toast } from 'sonner';
import { replaceObjectUrl } from '@/utils/object-url';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ImageDropzone } from '@/components/image-dropzone';
import { NoWheelNumber } from '@/components/no-wheel-number';
import { SelectDropdown } from '@/components/select-dropdown';
import { TwitterEmbed } from '@/components/twitter-embed';
import { apiToForm, formToApi, getDefaultFormValues } from './adapters/form-api-adapter';
import { uploadMedia } from './api';
import { ChildrenEditor } from './components/children-editor';
import { groups, providers, types } from './data/data';
import type { Task } from './data/types';
import { questFormSchema } from './types/form-schema';
import type { QuestFormValues } from './types/form-types';

// Use our clean form schema
const schema = questFormSchema;
type FormValues = QuestFormValues;

export const QuestForm = ({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Task>;
  onSubmit: (v: FormValues) => void | Promise<void>;
  onCancel: () => void;
}) => {
  const auth = useAppAuth();
  const [iconPreview, setIconPreview] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const clearIconPreview = () => setIconPreview((old) => replaceObjectUrl(old));
  const initialValues = useMemo(
    () => (initial ? apiToForm(initial) : getDefaultFormValues()),
    [initial],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const type = useWatch({ control: form.control, name: 'type' });
  const icon = useWatch({ control: form.control, name: 'resources.icon' });
  const isSubmitting = form.formState.isSubmitting;
  const adsgramType = useWatch({
    control: form.control,
    name: 'resources.adsgram.type',
  });

  const groupItems = useMemo(() => groups.map(({ label, value }) => ({ label, value })), []);
  const typeItems = useMemo(() => types.map(({ label, value }) => ({ label, value })), []);
  const providerItems = useMemo(() => providers.map(({ label, value }) => ({ label, value })), []);

  useEffect(() => {
    if (adsgramType !== 'task') {
      form.setValue('resources.adsgram.subtype', undefined, {
        shouldDirty: true,
      });
    }
  }, [adsgramType, form]);

  const blocker = useBlocker({
    shouldBlockFn: () => form.formState.isDirty,
    withResolver: true,
  });

  useEffect(() => {
    if (blocker.status === 'blocked') {
      if (window.confirm('Discard changes?')) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!form.formState.isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form.formState.isDirty]);

  const handleUpload = async (file: File) => {
    setIconPreview((old) => replaceObjectUrl(old, file));
    setIsUploading(true);
    try {
      const url = await uploadMedia(file, await auth.getAccessToken());
      form.setValue('resources.icon', url, { shouldDirty: true });
    } catch {
      toast.error(mediaErrors.upload);
      clearIconPreview();
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearIcon = () => {
    form.setValue('resources.icon', undefined, { shouldDirty: true });
    clearIconPreview();
  };

  const handleReset = () => {
    form.reset(initialValues);
    if (initial?.resources?.icon) {
      setIconPreview(initial.resources.icon);
    } else {
      clearIconPreview();
    }
  };

  useEffect(() => {
    if (!icon) {
      clearIconPreview();
      return;
    }
    if (iconPreview) return;

    const controller = new AbortController();
    let localUrl: string | undefined;

    const load = async () => {
      try {
        const token = await auth.getAccessToken();
        const res = await fetch(icon, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        setIconPreview((oldUrl) => {
          const newUrl = replaceObjectUrl(oldUrl, blob);
          localUrl = newUrl;
          return newUrl;
        });
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          toast.error(mediaErrors.load);
        }
      }
    };
    void load();

    return () => {
      controller.abort();
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [icon, auth, iconPreview]);

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(async (values) => {
          // Convert form values to API format using adapter
          const apiData = formToApi(values);
          // Update child order_by values
          if (apiData.child) {
            apiData.child = apiData.child.map((c, i: number) => ({ ...c, order_by: i }));
          }
          await onSubmit(values);
        })}
        className='mx-auto max-w-5xl space-y-6'
      >
        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Enter a title' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <SelectDropdown
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder='Select type'
                  items={typeItems}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='group'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group</FormLabel>
                <SelectDropdown
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder='Select group'
                  items={groupItems}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='order_by'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <NoWheelNumber
                    {...field}
                    value={field.value}
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
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='sm:col-span-2'>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='provider'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <SelectDropdown
                  value={field.value}
                  onValueChange={(v) => field.onChange(v || undefined)}
                  placeholder='Select provider'
                  items={providerItems}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='resources.username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Enter username (e.g. waitlist)'
                    onBlur={(e) => field.onChange((e.target.value ?? '').trim().replace(/^@/, ''))}
                  />
                </FormControl>
                <FormDescription>Without @. Defaults to waitlist if empty</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='resources.tweetId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter Post</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Enter Tweet ID (e.g. 1872110056027116095)'
                    onBlur={(e) => field.onChange((e.target.value ?? '').trim())}
                  />
                </FormControl>
                <FormDescription>Only Tweet ID (the last part of the Twitter URL).</FormDescription>
                <FormMessage />
                {field.value && (
                  <div className='mt-4'>
                    <TwitterEmbed
                      username={
                        form.getValues('resources.username')?.replace(/^@/, '') ?? 'waitlist'
                      }
                      tweetId={field.value}
                    />
                  </div>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='uri'
            render={({ field }) => (
              <FormItem>
                <FormLabel>URI</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='https://…' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='reward'
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
          {type === 'multiple' && (
            <div className='sm:col-span-2'>
              <ChildrenEditor />
            </div>
          )}
          <FormField
            control={form.control}
            name='visible'
            render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-md border p-3'>
                <FormLabel className='m-0'>Visible</FormLabel>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='resources.isNew'
            render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-md border p-3'>
                <FormLabel className='m-0'>New badge</FormLabel>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='resources.ui.button'
            render={({ field }) => (
              <FormItem>
                <FormLabel>UI Button</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button type='button' variant='outline'>
                Advanced
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-4 space-y-4'>
              <div className='space-y-3 rounded-md border p-4'>
                <div className='text-sm font-medium'>Pop-up</div>
                <FormField
                  control={form.control}
                  name={'resources.ui.pop-up.name' as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'resources.ui.pop-up.button' as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'resources.ui.pop-up.description' as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'resources.ui.pop-up.static' as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Static</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} placeholder='https://…' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'resources.ui.pop-up.additional-title' as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional title</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'resources.ui.pop-up.additional-description' as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional description</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='space-y-3 rounded-md border p-4'>
                <div className='text-sm font-medium'>AdsGram</div>
                <FormField
                  control={form.control}
                  name='resources.block_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AdsGram Block ID</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='resources.adsgram.type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AdsGram Type</FormLabel>
                      <SelectDropdown
                        value={field.value ?? 'none'}
                        onValueChange={(v) => {
                          const next = v === 'none' ? undefined : (v as 'task' | 'reward');
                          field.onChange(next);
                          if (next !== 'task') {
                            form.setValue('resources.adsgram.subtype', undefined, {
                              shouldDirty: true,
                            });
                          }
                        }}
                        placeholder='Select type'
                        items={[
                          { label: '—', value: 'none' },
                          { label: 'task', value: 'task' },
                          { label: 'reward', value: 'reward' },
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {adsgramType === 'task' && (
                  <FormField
                    control={form.control}
                    name='resources.adsgram.subtype'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AdsGram Subtype</FormLabel>
                        <SelectDropdown
                          value={field.value ?? 'none'}
                          onValueChange={(v) => field.onChange(v === 'none' ? undefined : v)}
                          placeholder='Select subtype'
                          items={[
                            { label: '—', value: 'none' },
                            { label: 'video-ad', value: 'video-ad' },
                            {
                              label: 'post-style-image',
                              value: 'post-style-image',
                            },
                          ]}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className='space-y-2'>
          <FormLabel>Icon</FormLabel>
          <ImageDropzone
            preview={iconPreview}
            onFile={handleUpload}
            onClear={handleClearIcon}
            disabled={isUploading}
            loading={isUploading}
          />
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' type='button' onClick={handleReset}>
            Reset
          </Button>
          <Button variant='outline' type='button' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <Spinner className='mr-2' />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};
