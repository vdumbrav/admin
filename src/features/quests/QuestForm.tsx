import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Task } from '@/types/tasks'
import { defaultPartnerTask } from '@/types/tasks'
import { uploadMedia } from './api'

const schema = z
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
    order_by: z.number().int().nonnegative(),
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
    reward: z.number().int().optional(),
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

type FormValues = z.infer<typeof schema>

export function QuestForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<Task>
  onSubmit: (v: FormValues) => void
}) {
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      type: (initial?.type as Task['type']) ?? 'external',
      description: initial?.description ?? '',
      group: (initial?.group as Task['group']) ?? 'all',
      order_by: initial?.order_by ?? 0,
      provider: initial?.provider as Task['provider'],
      uri: initial?.uri ?? '',
      reward: initial?.reward ?? 0,
      resources: initial?.resources ?? { ui: { button: '' } },
      visible: initial?.visible ?? true,
    },
  })

  const icon = watch('resources.icon')
  const typeValue = watch('type')
  const provider = watch('provider')

  useEffect(() => {
    if (typeValue === 'partner_invite') {
      setValue('title', defaultPartnerTask.title, { shouldDirty: true })
      setValue('description', defaultPartnerTask.description ?? '', {
        shouldDirty: true,
      })
      setValue('group', defaultPartnerTask.group, { shouldDirty: true })
      setValue('order_by', defaultPartnerTask.order_by, { shouldDirty: true })
      setValue('uri', defaultPartnerTask.uri ?? '', { shouldDirty: true })
      const btn = defaultPartnerTask.resources?.ui?.button ?? ''
      setValue('resources.ui.button', btn, { shouldDirty: true })
    }
  }, [typeValue, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <label>Title</label>
          <input className='input' {...register('title')} />
        </div>
        <div>
          <label>Type</label>
          <select className='input' {...register('type')}>
            <option value='referral'>referral</option>
            <option value='connect'>connect</option>
            <option value='join'>join</option>
            <option value='share'>share</option>
            <option value='like'>like</option>
            <option value='comment'>comment</option>
            <option value='multiple'>multiple</option>
            <option value='repeatable'>repeatable</option>
            <option value='dummy'>dummy</option>
            <option value='partner_invite'>partner_invite</option>
            <option value='external'>external</option>
          </select>
        </div>
        <div>
          <label>Group</label>
          <select className='input' {...register('group')}>
            <option value='social'>social</option>
            <option value='daily'>daily</option>
            <option value='referral'>referral</option>
            <option value='partner'>partner</option>
            <option value='all'>all</option>
          </select>
        </div>
        <div>
          <label>Order</label>
          <input
            type='number'
            className='input'
            {...register('order_by', { valueAsNumber: true })}
          />
        </div>
        <div className='sm:col-span-2'>
          <label>Description</label>
          <textarea className='input' rows={4} {...register('description')} />
        </div>
        <div>
          <label>Provider</label>
          <select className='input' {...register('provider')}>
            <option value=''>—</option>
            <option value='twitter'>twitter</option>
            <option value='telegram'>telegram</option>
            <option value='discord'>discord</option>
            <option value='matrix'>matrix</option>
            <option value='walme'>walme</option>
            <option value='monetag'>monetag</option>
            <option value='adsgram'>adsgram</option>
          </select>
        </div>
        {provider === 'twitter' && (
          <>
            <div>
              <label>Tweet ID</label>
              <input className='input' {...register('resources.tweetId')} />
            </div>
            <div>
              <label>Username</label>
              <input className='input' {...register('resources.username')} />
            </div>
          </>
        )}
        <div>
          <label>URI</label>
          <input className='input' {...register('uri')} />
        </div>
        <div>
          <label>Reward</label>
          <input
            type='number'
            className='input'
            {...register('reward', { valueAsNumber: true })}
          />
        </div>
        <div>
          <label className='flex items-center gap-2'>
            <input type='checkbox' {...register('visible')} /> Visible
          </label>
        </div>
        <div>
          <label className='flex items-center gap-2'>
            <input type='checkbox' {...register('resources.isNew')} /> New badge
          </label>
        </div>
        <div>
          <label>UI Button</label>
          <input className='input' {...register('resources.ui.button')} />
        </div>
        <div className='space-y-2 sm:col-span-2'>
          <label className='block'>Pop-up</label>
          <input
            className='input'
            placeholder='name'
            {...register("resources.ui['pop-up'].name")}
          />
          <input
            className='input'
            placeholder='button'
            {...register("resources.ui['pop-up'].button")}
          />
          <textarea
            className='input'
            placeholder='description'
            {...register("resources.ui['pop-up'].description")}
          />
          <input
            className='input'
            placeholder='static'
            {...register("resources.ui['pop-up'].static")}
          />
          <input
            className='input'
            placeholder='additional title'
            {...register("resources.ui['pop-up']['additional-title']")}
          />
          <input
            className='input'
            placeholder='additional description'
            {...register("resources.ui['pop-up']['additional-description']")}
          />
        </div>
        <div>
          <label>AdsGram Block ID</label>
          <input className='input' {...register('resources.block_id')} />
        </div>
        <div>
          <label>AdsGram Type</label>
          <select className='input' {...register('resources.adsgram.type')}>
            <option value=''>—</option>
            <option value='task'>task</option>
            <option value='reward'>reward</option>
          </select>
        </div>
        <div>
          <label>AdsGram Subtype</label>
          <select className='input' {...register('resources.adsgram.subtype')}>
            <option value=''>—</option>
            <option value='video-ad'>video-ad</option>
            <option value='post-style-image'>post-style-image</option>
          </select>
        </div>
      </div>

      <div className='space-y-2'>
        <label htmlFor='icon-upload' className='block text-sm font-medium'>
          Icon
        </label>
        {icon ? (
          <img src={icon} className='h-16 w-16 rounded border object-contain' />
        ) : null}
        <input
          id='icon-upload'
          type='file'
          accept='image/*'
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            const { url } = await uploadMedia(f)
            setValue('resources.icon', url, { shouldDirty: true })
          }}
        />
      </div>

      <button className='btn-primary' type='submit'>
        Save
      </button>
    </form>
  )
}
