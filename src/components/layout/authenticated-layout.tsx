import Cookies from 'js-cookie';
import { Outlet } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchProvider } from '@/context/search-context';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import SkipToMain from '@/components/skip-to-main';

interface Props {
  children?: React.ReactNode;
}

function MobileSidebarTrigger() {
  return (
    <div className='fixed top-4 left-4 z-50 lg:hidden'>
      <SidebarTrigger
        variant='outline'
        className='bg-background/80 backdrop-blur-sm'
        aria-label='Toggle sidebar'
      >
        <Menu className='h-4 w-4' />
      </SidebarTrigger>
    </div>
  );
}

function CollapsedSidebarTrigger() {
  const { state } = useSidebar();

  if (state === 'expanded') return null;

  return (
    <div className='fixed bottom-4 left-4 z-50 hidden lg:block'>
      <SidebarTrigger
        variant='outline'
        className='bg-background/80 shadow-lg backdrop-blur-sm'
        aria-label='Open sidebar'
      >
        <Menu className='h-4 w-4' />
      </SidebarTrigger>
    </div>
  );
}

export function AuthenticatedLayout({ children }: Props) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false';
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <MobileSidebarTrigger />
        <CollapsedSidebarTrigger />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh',
          )}
        >
          {children ?? <Outlet />}
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
