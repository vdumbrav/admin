import { IconChecklist } from '@tabler/icons-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '',
    email: '',
    avatar: '',
  },
  teams: [],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Quests',
          url: '/quests',
          icon: IconChecklist,
        },
      ],
    },
  ],
}
