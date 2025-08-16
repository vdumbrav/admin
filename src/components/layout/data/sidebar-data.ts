import { IconChecklist } from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
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
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
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
