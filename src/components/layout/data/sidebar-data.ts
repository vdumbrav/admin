import { IconChecklist } from '@tabler/icons-react';
import { CedraLogo } from '@/components/icons/cedra-logo';
import { type SidebarData } from '../types';

export const sidebarData: SidebarData = {
  user: {
    name: 'admin',
    email: 'admin@cedradev.xyz',
    avatar: '/images/favicon.png',
  },
  teams: [
    {
      name: 'Waitlist Admin',
      logo: CedraLogo,
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
};
