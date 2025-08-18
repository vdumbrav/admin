export interface PopUp {
  name: string
  button: string
  description: string
  static?: string
  'additional-title'?: string
  'additional-description'?: string
}

export interface UIResources {
  'pop-up'?: PopUp
  button: string
}

export interface AdsGramResource {
  type: 'task' | 'reward'
  subtype?: 'video-ad' | 'post-style-image'
}

export interface Resources {
  ui?: UIResources
  icon?: string
  tweetId?: string
  username?: string
  twitterUsername?: string
  isNew?: boolean
  block_id?: string
  adsgram?: AdsGramResource
}

export interface IteratorDaily {
  day: number
  days: number
  reward_map: number[]
  reward_max: number
  reward: number
  tick?: number
}

export type TaskType =
  | 'referral'
  | 'connect'
  | 'join'
  | 'share'
  | 'like'
  | 'comment'
  | 'multiple'
  | 'repeatable'
  | 'dummy'
  | 'partner_invite'
  | 'external'

export type TaskGroup = 'social' | 'daily' | 'referral' | 'partner' | 'all'

export type TaskProvider =
  | 'twitter'
  | 'telegram'
  | 'discord'
  | 'matrix'
  | 'walme'
  | 'monetag'
  | 'adsgram'

export interface Task {
  id: number
  type: TaskType
  title: string
  description: string | null
  blocking_task?: number | null
  reward?: number
  level?: number
  group: TaskGroup
  order_by: number
  provider?: TaskProvider
  uri?: string | null
  status?: 'new' | 'started' | 'completed' | 'failed' | 'locked'
  error?: string | null
  started_at?: string | null
  completed_at?: string | null
  next_tick?: string | null
  resources?: Resources | null
  child?: Array<Task> | null
  iterable?: boolean | null
  iterator?: IteratorDaily | null
  providerCapitalized?: string
  visible?: boolean // если отсутствует — трактуем как true
}

export const defaultPartnerTask: Task = {
  id: 99999,
  type: 'partner_invite',
  title: 'Would you like to become a partner?',
  description:
    'Fill out the partnership request form. <br />Our team will review it and get in touch.',
  group: 'partner',
  order_by: 9999,
  uri: 'https://partners.walme.io/',
  resources: {
    ui: {
      button: 'Fill out the form',
    },
  },
}
