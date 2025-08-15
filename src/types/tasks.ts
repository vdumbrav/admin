export interface Resources {
  icon?: string
  ui?: {
    button?: string
    'pop-up'?: unknown
  }
}

export interface Task {
  id: number
  title: string
  type: string
  description?: string | null
  group: string
  order_by: number
  provider?: string
  uri?: string
  reward?: number
  resources?: Resources
}
