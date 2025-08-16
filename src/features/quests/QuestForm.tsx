'use client'

import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useBlocker } from '@tanstack/react-router'
import { defaultPartnerTask, type Task } from '@/types/tasks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { uploadMedia } from './api'
import { groups, types, providers } from './data/data'
import { ChildrenEditor } from './components/children-editor'
import type { Child } from './components/children-editor'
import { withTwitterValidation } from './validation'

const childSchema = withTwitterValidation(
  z.object({
    title: z.string().min(1),
    type: z.enum(['like', 'share', 'comment', 'join', 'connect']),
    provider: z
      .enum([
        'twitter',
        'telegram',
        'discord',
        'matrix',
        'walme',
        'monetag',
        'adsgram',
      ])
      .optional(),
    reward: z.coerce.number().int().optional(),
    order_by: z.coerce.number().int().nonnegative(),
    resources: z
      .object({
        tweetId: z.string().optional(),
        username: z.string().optional(),
      })
      .optional(),
  })
)

const baseSchema = withTwitterValidation(
  z.object({
    title: z.string().min(1),
    type: z.enum([
      'referral',
      'connect',
      'join',
      'share',
      'like',
      'comment',
      'multiple',
      'repeatable',
      'dummy',
      'partner_invite',
      'external',
    ]),
    description: z.string().nullable().optional(),
    group: z.enum(['social', 'daily', 'referral', 'partner', 'all']),
    order_by: z.coerce.number().int().nonnegative(),
    provider: z
      .enum([
        'twitter',
        'telegram',
        'discord',
        'matrix',
        'walme',
        'monetag',
        'adsgram',
      ])
      .optional(),
    uri: z
      .string()
      .url()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    reward: z.coerce.number().int().optional(),
    resources: z
      .object({
        icon: z.string().url().optional(),
        tweetId: z.string().optional(),
        username: z.string().optional(),
        isNew: z.boolean().optional(),
        block_id: z.string().optional(),
        ui: z.object({
          button: z.string(),
          'pop-up': z
            .object({
              name: z.string(),
              button: z.string(),
              description: z.string(),
              static: z
                .string()
                .url()
                .optional()
                .or(z.literal('').transform(() => undefined)),
              'additional-title': z.string().optional(),
              'additional-description': z.string().optional(),
            })
            .optional(),
        }),
        adsgram: z
          .object({
            type: z.enum(['task', 'reward']),
            subtype: z.enum(['video-ad', 'post-style-image']).optional(),
          })
          .optional()
          .superRefine((val, ctx) => {
            if (val && val.type !== 'task' && val.subtype) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "subtype allowed only when type is 'task'",
                path: ['subtype'],
              })
            }
          }),
      })
      .optional(),
    visible: z.boolean().optional(),
  })
    .passthrough()
)

const schema = baseSchema.extend({ child: z.array(childSchema).optional() })

type FormValues = z.infer<typeof schema>

export const QuestForm = ({
  initial,
  onSubmit,
}: {
  initial?: Partial<Task>
  onSubmit: (v: FormValues) => void
}) => {
  const nav = useNavigate({})
  const fileRef = useRef<HTMLInputElement | null>(null)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      type: (initial?.type as Task['type']) ?? 'external',
      description: initial?.description ?? '',
      group: (initial?.group as Task['group']) ?? 'all',
      order_by: initial?.order_by ?? 0,
      provider: initial?.provider as Task['provider'],
      uri: initial?.uri ?? '',
      reward: initial?.reward,
      resources: initial?.resources ?? { ui: { button: '' } },
      visible: initial?.visible ?? true,
      child:
        initial?.child?.map((c) => ({
          title: c.title ?? '',
          type: c.type as Child['type'],
          provider: c.provider,
          reward: c.reward,
          order_by: c.order_by ?? 0,
          resources: c.resources
            ? { tweetId: c.resources.tweetId, username: c.resources.username }
            : undefined,
        })) ?? [],
    },
  })

  const type = useWatch({ control: form.control, name: 'type' })
  const provider = useWatch({ control: form.control, name: 'provider' })
  const icon = useWatch({ control: form.control, name: 'resources.icon' })
  const adsgramType = useWatch({
    control: form.control,
    name: 'resources.adsgram.type',
  })

  const popupField = (key: string) => `resources.ui['pop-up'].${key}` as const

  useEffect(() => {
    if (type !== 'partner_invite') return
    const values = form.getValues()
    if (!values.title) {
      form.setValue('title', defaultPartnerTask.title, { shouldDirty: true })
    }
    if (!values.description) {
      form.setValue('description', defaultPartnerTask.description ?? '', {
        shouldDirty: true,
      })
    }
    if (values.group === 'all') {
      form.setValue('group', defaultPartnerTask.group, { shouldDirty: true })
    }
    if (values.order_by === 0) {
      form.setValue('order_by', defaultPartnerTask.order_by, {
        shouldDirty: true,
      })
    }
    if (!values.uri) {
      form.setValue('uri', defaultPartnerTask.uri ?? '', { shouldDirty: true })
    }
    if (!values.resources?.ui?.button) {
      form.setValue(
        'resources.ui.button',
        defaultPartnerTask.resources?.ui?.button ?? '',
        { shouldDirty: true }
      )
    }
  }, [type, form])

  useEffect(() => {
    if (adsgramType !== 'task') {
      form.setValue('resources.adsgram.subtype', undefined, {
        shouldDirty: true,
      })
    }
  }, [adsgramType, form])

  const blocker = useBlocker({
    shouldBlockFn: () => form.formState.isDirty,
    withResolver: true,
  })

  useEffect(() => {
    if (blocker.status === 'blocked') {
      if (window.confirm('Discard changes?')) blocker.proceed?.()
      else blocker.reset?.()
    }
  }, [blocker])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!form.formState.isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [form.formState.isDirty])

  const handleUpload = async (file: File) => {
    try {
      const { url } = await uploadMedia(file)
      form.setValue('resources.icon', url, { shouldDirty: true })
    } catch {
      toast.error('Failed to upload icon')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit({
            ...values,
            child: values.child?.map((c, i) => ({ ...c, order_by: i })),
          })
        )}
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
                  defaultValue={field.value as string}
                  onValueChange={field.onChange}
                  placeholder='Select type'
                  items={types.map(({ label, value }) => ({ label, value }))}
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
                  defaultValue={field.value as string}
                  onValueChange={field.onChange}
                  placeholder='Select group'
                  items={groups.map(({ label, value }) => ({ label, value }))}
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
                  <Input
                    type='number'
                    {...field}
                    value={field.value as number}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : Number(e.target.value)
                      )
                    }
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
                  defaultValue={field.value as string}
                  onValueChange={(v) => field.onChange(v || undefined)}
                  placeholder='Select provider'
                  items={providers.map(({ label, value }) => ({
                    label,
                    value,
                  }))}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {provider === 'twitter' && (
            <>
              <FormField
                control={form.control}
                name='resources.tweetId'
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
                control={form.control}
                name='resources.username'
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
            </>
          )}
          <FormField
            control={form.control}
            name='uri'
            render={({ field }) => (
              <FormItem>
                <FormLabel>URI</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input
                    type='number'
                    {...field}
                    value={(field.value as number | undefined) ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
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
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
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
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
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
            <CollapsibleContent className='space-y-4'>
              <div className='space-y-3 rounded-md border p-4'>
                <div className='text-sm font-medium'>Pop-up</div>
                <FormField
                  control={form.control}
                  name={popupField('name')}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={popupField('button')}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={popupField('description')}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={popupField('static')}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Static</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={popupField('additional-title')}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={popupField('additional-description')}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional description</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                        defaultValue={field.value || 'none'}
                        onValueChange={(v) => {
                          const next = v === 'none' ? '' : v
                          field.onChange(next)
                          if (next !== 'task') {
                            form.setValue(
                              'resources.adsgram.subtype',
                              undefined,
                              { shouldDirty: true }
                            )
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
                          defaultValue={field.value || 'none'}
                          onValueChange={(v) =>
                            field.onChange(v === 'none' ? '' : v)
                          }
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
          {icon ? (
            <img
              src={icon}
              className='h-16 w-16 rounded border object-contain'
            />
          ) : null}
          <input
            ref={fileRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) await handleUpload(f)
            }}
          />
          <Button
            type='button'
            variant='outline'
            onClick={() => fileRef.current?.click()}
          >
            Upload Icon
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            type='button'
            onClick={() => nav({ to: '/quests' })}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
