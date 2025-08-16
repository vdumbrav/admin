import { IconChecklist } from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'admin',
    email: 'admin@example.com',
    avatar: '/images/favicon.png',
  },
  teams: [
    {
      name: 'Waitlist Admin',
      logo: Command,
      plan: 'Internal',
    },
  ],
  navGroups: [
    {
      title: 'Quests',
      items: [
        {
          title: 'Quests',
          url: '/quests',
          icon: IconChecklist,
          isActive: (pathname: string) => pathname.startsWith('/quests'),
        },
      ],
    },
  ],
}
