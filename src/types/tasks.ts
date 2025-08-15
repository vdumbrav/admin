export interface PopUp {
  name?: string
  button?: string
  description?: string
  static?: boolean
  'additional-title'?: string
  'additional-description'?: string
}

export interface UIResources {
  button?: string
  'pop-up'?: PopUp
}

export interface AdsGramResource {
  block_id?: string
}

export interface Resources {
  icon?: string
  ui?: UIResources
  tweetId?: string
  username?: string
  isNew?: boolean
  adsgram?: AdsGramResource
}

export interface IteratorDaily {
  days: number
  reward_map: number[]
  reward_max: number
  day?: number
  reward?: number
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
  title: string
  type: TaskType
  description: string | null
  group: TaskGroup
  order_by: number
  provider?: TaskProvider
  uri?: string
  reward?: number
  level?: number
  blocking_task?: number | null
  iterable?: boolean
  status?: 'new' | 'started' | 'completed' | 'failed' | 'locked'
  resources?: Resources
  child?: Task[]
  iterator?: IteratorDaily
  visible?: boolean // если отсутствует — трактуем как true
}

export const defaultPartnerTask: Task = {
  id: 0,
  title: '',
  type: 'partner_invite',
  description: null,
  group: 'partner',
  order_by: 0,
  provider: undefined,
  uri: undefined,
  reward: undefined,
  resources: {},
  visible: true,
}
