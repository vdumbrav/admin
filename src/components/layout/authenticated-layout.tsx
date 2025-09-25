import Cookies from 'js-cookie';
import { Outlet } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { SearchProvider } from '@/context/search-context';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import SkipToMain from '@/components/skip-to-main';

interface Props {
  children?: React.ReactNode;
}

function MobileOverlay() {
  const { state, isMobile, toggleSidebar } = useSidebar();

  if (!isMobile || state !== 'expanded') return null;

  return (
    <div
      className='fixed inset-0 z-40 bg-black/10 backdrop-blur-xs'
      onClick={toggleSidebar}
      aria-label='Close sidebar'
    />
  );
}


export function AuthenticatedLayout({ children }: Props) {
  const isMobile = useIsMobile();
  const defaultOpen = isMobile ? false : Cookies.get('sidebar_state') !== 'false';
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <MobileOverlay />
        <div
          id='content'
          className={cn(
            'w-full max-w-full',
            'md:ml-auto',
            'md:peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]',
            'md:peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'md:transition-[width] md:duration-200 md:ease-linear',
            'ml-12 w-[calc(100%-3rem)]',
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
