'use client'

import { useEffect, useState, useMemo } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { Spinner } from '@radix-ui/themes'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { mediaErrors } from '@/errors/media'
import { toast } from 'sonner'
import { replaceObjectUrl } from '@/utils/object-url'
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
  FormDescription,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ImageDropzone } from '@/components/image-dropzone'
import { NoWheelNumber } from '@/components/no-wheel-number'
import { SelectDropdown } from '@/components/select-dropdown'
import { TwitterEmbed } from '@/components/twitter-embed'
import { uploadMedia } from './api'
import { ChildrenEditor } from './components/children-editor'
import type { Child } from './components/children-editor'
import { groups, types, providers } from './data/data'
import type { Task } from './data/types'
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
    reward: z.coerce.number().int().nonnegative().optional(),
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
  z
    .object({
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
        .union([z.url(), z.literal('')])
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
      reward: z.coerce.number().int().nonnegative().optional(),
      resources: z
        .object({
          icon: z.url().optional(),
          tweetId: z.string().optional(),
          username: z.string().optional(),
          isNew: z.boolean().optional(),
          block_id: z.string().optional(),
          ui: z
            .object({
              button: z.string(),
              'pop-up': z
                .object({
                  name: z.string(),
                  button: z.string(),
                  description: z.string(),
                  static: z
                    .union([z.url(), z.literal('')])
                    .optional()
                    .transform((val) => (val === '' ? undefined : val)),
                  'additional-title': z.string().optional(),
                  'additional-description': z.string().optional(),
                })
                .optional(),
            })
            .optional(),
          adsgram: z
            .object({
              type: z.enum(['task', 'reward']),
              subtype: z.enum(['video-ad', 'post-style-image']).optional(),
            })
            .optional()
            .superRefine((val, ctx) => {
              if (val && val.type !== 'task' && val.subtype) {
                ctx.addIssue({
                  code: 'custom',
                  message: "subtype allowed only when type is 'task'",
                  path: ['subtype'],
                })
              }
            }),
        })
        .optional(),
      visible: z.boolean().optional(),
    })
    .loose()
)

const schema = baseSchema.and(
  z.object({ child: z.array(childSchema).optional() })
)

type FormValues = z.infer<typeof schema>

export const QuestForm = ({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Task>
  onSubmit: (v: FormValues) => void
  onCancel: () => void
}) => {
  const auth = useAppAuth()
  const [iconPreview, setIconPreview] = useState<string>()
  const [isUploading, setIsUploading] = useState(false)
  const clearIconPreview = () => setIconPreview((old) => replaceObjectUrl(old))
  const initialValues = useMemo(
    () => ({
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
    }),
    [initial]
  )

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  const type = useWatch({ control: form.control, name: 'type' })
  const icon = useWatch({ control: form.control, name: 'resources.icon' })
  const isSubmitting = form.formState.isSubmitting
  const adsgramType = useWatch({
    control: form.control,
    name: 'resources.adsgram.type',
  })

  const groupItems = useMemo(
    () => groups.map(({ label, value }) => ({ label, value })),
    []
  )
  const typeItems = useMemo(
    () => types.map(({ label, value }) => ({ label, value })),
    []
  )
  const providerItems = useMemo(
    () => providers.map(({ label, value }) => ({ label, value })),
    []
  )

  const popupField = (key: string) => `resources.ui['pop-up'].${key}` as const

  useEffect(() => {
    if (type !== 'partner_invite') return
    const values = form.getValues()
    if (!values.title) {
      form.setValue('title', 'Would you like to become a partner?', {
        shouldDirty: true,
      })
    }
    if (!values.description) {
      form.setValue(
        'description',
        'Fill out the partnership request form. <br />Our team will review it and get in touch.',
        {
          shouldDirty: true,
        }
      )
    }
    if (values.group === 'all') {
      form.setValue('group', 'partner', { shouldDirty: true })
    }
    if (values.order_by === 0) {
      form.setValue('order_by', 9999, {
        shouldDirty: true,
      })
    }
    if (!values.uri) {
      form.setValue('uri', 'https://partners.walme.io/', { shouldDirty: true })
    }
    if (!values.resources?.ui?.button) {
      form.setValue('resources.ui.button', 'Fill out the form', {
        shouldDirty: true,
      })
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
    setIconPreview((old) => replaceObjectUrl(old, file))
    setIsUploading(true)
    try {
      const url = await uploadMedia(file, await auth.getAccessToken())
      form.setValue('resources.icon', url, { shouldDirty: true })
    } catch {
      toast.error(mediaErrors.upload)
      clearIconPreview()
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearIcon = () => {
    form.setValue('resources.icon', undefined, { shouldDirty: true })
    clearIconPreview()
  }

  const handleReset = () => {
    form.reset(initialValues)
    if (initial?.resources?.icon) {
      setIconPreview(initial.resources.icon)
    } else {
      clearIconPreview()
    }
  }

  useEffect(() => {
    if (!icon) {
      clearIconPreview()
      return
    }
    if (iconPreview) return

    const controller = new AbortController()
    let localUrl: string | undefined

    const load = async () => {
      try {
        const token = await auth.getAccessToken()
        const res = await fetch(icon, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(String(res.status))
        const blob = await res.blob()
        setIconPreview((oldUrl) => {
          const newUrl = replaceObjectUrl(oldUrl, blob)
          localUrl = newUrl
          return newUrl
        })
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          toast.error(mediaErrors.load)
        }
      }
    }
    load()

    return () => {
      controller.abort()
      if (localUrl) URL.revokeObjectURL(localUrl)
    }
  }, [icon, auth, iconPreview])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          const v = { ...values }
          onSubmit({
            ...v,
            child: v.child?.map((c, i) => ({ ...c, order_by: i })),
          })
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
                    value={field.value as number}
                    onChange={(e) =>
                      field.onChange(
                        Number.isNaN(e.target.valueAsNumber)
                          ? 0
                          : e.target.valueAsNumber
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
                    onBlur={(e) =>
                      field.onChange(
                        (e.target.value ?? '').trim().replace(/^@/, '')
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Without @. Defaults to waitlist if empty
                </FormDescription>
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
                    onBlur={(e) =>
                      field.onChange((e.target.value ?? '').trim())
                    }
                  />
                </FormControl>
                <FormDescription>
                  Only Tweet ID (the last part of the Twitter URL).
                </FormDescription>
                <FormMessage />
                {field.value && (
                  <div className='mt-4'>
                    <TwitterEmbed
                      username={
                        form
                          .getValues('resources.username')
                          ?.replace(/^@/, '') || 'waitlist'
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
                    value={(field.value as number | undefined) ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        Number.isNaN(e.target.valueAsNumber)
                          ? undefined
                          : e.target.valueAsNumber
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
            <CollapsibleContent className='mt-4 space-y-4'>
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
                        <Input {...field} placeholder='https://…' />
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
                        value={field.value ?? 'none'}
                        onValueChange={(v) => {
                          const next =
                            v === 'none' ? undefined : (v as 'task' | 'reward')
                          field.onChange(next)
                          if (next !== 'task') {
                            form.setValue(
                              'resources.adsgram.subtype',
                              undefined,
                              {
                                shouldDirty: true,
                              }
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
                          value={field.value ?? 'none'}
                          onValueChange={(v) =>
                            field.onChange(v === 'none' ? undefined : v)
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
          <Button
            type='submit'
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting && <Spinner className='mr-2' />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
