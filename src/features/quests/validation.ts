import { z } from 'zod'

export const withTwitterValidation = <T extends z.ZodTypeAny>(schema: T): T =>
  schema.superRefine((val: unknown, ctx) => {
    const v = val as {
      type?: string
      provider?: string
      resources?: {
        tweetId?: string
        username?: string
        twitterUsername?: string
      }
    }
    const needsTweet =
      ['like', 'share', 'comment'].includes(v.type ?? '') &&
      v.provider === 'twitter'
    if (!needsTweet) return
    const tweetId = v.resources?.tweetId
    if (!tweetId) {
      ctx.addIssue({
        path: ['resources', 'tweetId'],
        code: z.ZodIssueCode.custom,
        message: 'Tweet ID is required for Twitter like/share/comment.',
      })
    } else if (!/^\d+$/.test(tweetId)) {
      ctx.addIssue({
        path: ['resources', 'tweetId'],
        code: z.ZodIssueCode.custom,
        message: 'Tweet ID must be numeric.',
      })
    }
    if (!v.resources?.twitterUsername && !v.resources?.username) {
      ctx.addIssue({
        path: ['resources', 'twitterUsername'],
        code: z.ZodIssueCode.custom,
        message: 'Username is required for Twitter like/share/comment.',
      })
    }
  }) as T
