import { z } from 'zod'
import type { Task as BaseTask } from '@/types/tasks'

export const questSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.string(),
  provider: z.string().optional(),
  group: z.string(),
  reward: z.number().optional(),
  order_by: z.number(),
  status: z.string().optional(),
  resources: z
    .object({
      username: z.string().optional(),
      tweetId: z.string().optional(),
      twitterUsername: z.string().optional(),
      isNew: z.boolean().optional(),
    })
    .optional(),
  visible: z.boolean().optional(),
})

export type Quest = z.infer<typeof questSchema> & Partial<BaseTask>
