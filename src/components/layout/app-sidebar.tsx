import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useAppAuth } from '@/auth/provider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavGroup } from '@/components/layout/nav-group';
import { NavUser } from '@/components/layout/nav-user';
import { TeamSwitcher } from '@/components/layout/team-switcher';
import { sidebarData } from './data/sidebar-data';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAppAuth();
  const isAdmin = auth.isAdmin;
  const navGroups = React.useMemo(() => {
    const groups = sidebarData.navGroups.map((g) => ({
      ...g,
      items: [...g.items],
    }));
    if (isAdmin) {
      const quests = groups.find((g) => g.title === 'Quests');
      quests?.items.push({
        title: 'New Quest',
        url: '/quests/new',
        icon: IconPlus,
        isActive: (p: string) => p.startsWith('/quests/new'),
      });
    }
    return groups;
  }, [isAdmin]);
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
