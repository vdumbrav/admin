import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useAppAuth } from '@/auth/hooks';
import { PanelLeftClose } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavGroup } from '@/components/layout/nav-group';
import { TeamSwitcher } from '@/components/layout/team-switcher';
import { AccountMenu } from '@/components/layout/account-menu';
import { sidebarData } from './data/sidebar-data';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAppAuth();
  const { toggleSidebar, state } = useSidebar();
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
      {sidebarData.teams && (
        <SidebarHeader>
          <TeamSwitcher teams={sidebarData.teams} />
        </SidebarHeader>
      )}
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
        <AccountMenu />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              className='w-full group'
              onClick={toggleSidebar}
              aria-label={state === 'expanded' ? 'Collapse menu' : 'Expand menu'}
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105'>
                <PanelLeftClose className='size-4 transition-transform data-[state=collapsed]:rotate-180' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {state === 'expanded' ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
