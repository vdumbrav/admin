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
  IconChartBar,
  IconCoin,
  IconCategory,
  IconBuildingBank,
  IconServer,
  IconNetwork,
  IconMoneybag,
  IconPigMoney,
  IconLanguage,
  IconChartPie,
  IconShieldCheck,
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
          icon: IconChartLine,
          isActive: (pathname: string) => pathname.startsWith('/analytics'),
          items: [
            {
              title: 'Overview',
              url: '/analytics',
              icon: IconChartLine,
              isActive: (pathname: string) => pathname === '/analytics',
            },
            {
              title: 'Metabase',
              url: '/analytics/metabase',
              icon: IconChartPie,
              isActive: (pathname: string) => pathname.startsWith('/analytics/metabase'),
            },
          ],
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
      title: 'Security',
      items: [
        {
          title: 'Fraud Detection',
          url: '/fraud' as any,
          icon: IconShieldCheck,
          isActive: (pathname: string) => pathname.startsWith('/fraud'),
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
      title: 'Markets Data',
      items: [
        {
          title: 'Markets',
          icon: IconChartBar,
          isActive: (pathname: string) => pathname.startsWith('/markets'),
          items: [
            {
              title: 'Coins',
              url: '/markets/coins',
              icon: IconCoin,
              isActive: (pathname: string) => pathname.startsWith('/markets/coins'),
            },
            {
              title: 'Categories',
              url: '/markets/categories',
              icon: IconCategory,
              isActive: (pathname: string) => pathname.startsWith('/markets/categories'),
            },
            {
              title: 'Exchanges',
              url: '/markets/exchanges',
              icon: IconBuildingBank,
              isActive: (pathname: string) => pathname.startsWith('/markets/exchanges'),
            },
            {
              title: 'Platforms',
              url: '/platforms',
              icon: IconServer,
              isActive: (pathname: string) => pathname.startsWith('/platforms'),
            },
            {
              title: 'Chains',
              url: '/markets/chains',
              icon: IconNetwork,
              isActive: (pathname: string) => pathname.startsWith('/markets/chains'),
            },
            {
              title: 'Funds',
              url: '/markets/funds',
              icon: IconMoneybag,
              isActive: (pathname: string) => pathname.startsWith('/markets/funds'),
            },
            {
              title: 'Treasuries',
              url: '/markets/treasuries',
              icon: IconPigMoney,
              isActive: (pathname: string) => pathname.startsWith('/markets/treasuries'),
            },
            {
              title: 'Languages',
              url: '/markets/languages',
              icon: IconLanguage,
              isActive: (pathname: string) => pathname.startsWith('/markets/languages'),
            },
          ],
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
