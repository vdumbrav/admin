import React from 'react';
import { IconMoon, IconPlus, IconSun } from '@tabler/icons-react';
import { useAppAuth } from '@/auth/hooks';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavGroup } from '@/components/layout/nav-group';
import { NavUser } from '@/components/layout/nav-user';
import { TeamSwitcher } from '@/components/layout/team-switcher';
import { sidebarData } from './data/sidebar-data';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAppAuth();
  const { theme, setTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
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
      </SidebarContent>
      <SidebarFooter>
        {/* Theme Switch */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                  aria-label='Toggle theme'
                >
                  <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                    <IconSun className='size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
                    <IconMoon className='absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>Theme</span>
                    <span className='truncate text-xs capitalize'>{theme}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                side='right'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <IconSun className='mr-2 size-4' />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <IconMoon className='mr-2 size-4' />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <div className='mr-2 size-4' />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        {/* User Profile */}
        <NavUser />

        <SidebarSeparator />

        {/* Sidebar Toggle */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              className='w-full'
              onClick={toggleSidebar}
              aria-label='Collapse menu'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <ArrowLeft className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>Collapse menu</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
