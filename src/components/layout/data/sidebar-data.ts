import {
  IconChecklist,
  IconLayoutDashboard,
  IconUsers,
  IconCreditCard,
  IconShoppingCart,
  IconArrowsExchange,
  IconWallet,
  IconChartLine,
  IconGift,
  IconCrown,
  IconBell,
} from '@tabler/icons-react';
import { type SidebarData } from '../types';

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: IconLayoutDashboard,
          isActive: (pathname: string) => pathname === '/dashboard',
        },
        {
          title: 'Analytics',
          url: '/analytics',
          icon: IconChartLine,
          isActive: (pathname: string) => pathname.startsWith('/analytics'),
        },
      ],
    },
    {
      title: 'Users & Content',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
          isActive: (pathname: string) => pathname.startsWith('/users'),
        },
        {
          title: 'Quests',
          url: '/quests',
          icon: IconChecklist,
          isActive: (pathname: string) => pathname.startsWith('/quests'),
        },
      ],
    },
    {
      title: 'Card Program',
      items: [
        {
          title: 'Cards',
          url: '/cards',
          icon: IconCreditCard,
          isActive: (pathname: string) => pathname.startsWith('/cards'),
        },
        {
          title: 'Orders',
          url: '/orders',
          icon: IconShoppingCart,
          isActive: (pathname: string) => pathname.startsWith('/orders'),
        },
        {
          title: 'Transactions',
          url: '/transactions',
          icon: IconArrowsExchange,
          isActive: (pathname: string) => pathname.startsWith('/transactions'),
        },
        {
          title: 'Master Balance',
          url: '/adscard-balance',
          icon: IconWallet,
          isActive: (pathname: string) =>
            pathname.startsWith('/adscard-balance'),
        },
      ],
    },
    {
      title: 'Programs',
      items: [
        {
          title: 'Referrals',
          url: '/referrals',
          icon: IconGift,
          isActive: (pathname: string) => pathname.startsWith('/referrals'),
        },
        {
          title: 'Premium',
          url: '/premium',
          icon: IconCrown,
          isActive: (pathname: string) => pathname.startsWith('/premium'),
        },
      ],
    },
    {
      title: 'Communication',
      items: [
        {
          title: 'Notifications',
          url: '/notifications',
          icon: IconBell,
          isActive: (pathname: string) => pathname.startsWith('/notifications'),
        },
      ],
    },
  ],
};
