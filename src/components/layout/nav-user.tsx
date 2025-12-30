import { useAppAuth } from '@/auth/hooks';
import { ChevronsUpDown, LogOut, Moon, Sun } from 'lucide-react';
import { getUserDisplayData } from '@/utils/user';
import { useTheme } from '@/context/theme-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export function NavUser() {
  const { isMobile } = useSidebar();
  const auth = useAppAuth();
  const { theme, setTheme } = useTheme();
  const { showName, userInitials, role } = getUserDisplayData(auth.user?.profile, auth.user);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              aria-label='Open profile menu'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={auth.user?.profile?.picture} />
                <AvatarFallback className='rounded-lg'>{userInitials}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{showName}</span>
                <span className='truncate text-xs'>{role}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={auth.user?.profile?.picture} />
                  <AvatarFallback className='rounded-lg'>{userInitials}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{showName}</span>
                  <span className='truncate text-xs'>{role}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className='mr-2 h-4 w-4 dark:hidden' />
                <Moon className='mr-2 h-4 w-4 hidden dark:block' />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
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
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => auth.signoutRedirect()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
