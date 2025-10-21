import { Link } from '@tanstack/react-router';
import { IconLogout, IconMoon, IconSun, IconUserCircle } from '@tabler/icons-react';
import { useTheme } from '@/context/theme-context';
import { useAppAuth } from '@/auth/hooks';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export function AccountMenu() {
  const { theme, setTheme } = useTheme();
  const auth = useAppAuth();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Account</SidebarGroupLabel>
      <SidebarMenu>
        {/* Profile */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Profile">
            <Link to="/profile" onClick={() => setOpenMobile(false)}>
              <IconUserCircle />
              <span>Profile</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Theme Toggle */}
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton tooltip="Toggle theme">
                <IconSun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <IconMoon className="absolute left-3 size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span>Theme</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
                <IconCheck size={14} className={cn('ml-auto', theme !== 'light' && 'hidden')} />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
                <IconCheck size={14} className={cn('ml-auto', theme !== 'dark' && 'hidden')} />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
                <IconCheck size={14} className={cn('ml-auto', theme !== 'system' && 'hidden')} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

        {/* Logout */}
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Logout" onClick={() => auth.signoutRedirect()}>
            <IconLogout />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
