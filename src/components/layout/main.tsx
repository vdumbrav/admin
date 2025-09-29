import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Main = ({ fixed, className, ...props }: MainProps) => {
  const { state, isMobile } = useSidebar();

  return (
    <main
      className={cn(
        'peer-[.header-fixed]/header:mt-16',
        'px-4 py-6',
        !isMobile && state === 'collapsed' && 'ml-[calc(var(--sidebar-width-icon)/2)]',
        fixed && 'fixed-main flex grow flex-col overflow-hidden',
        className,
      )}
      {...props}
    />
  );
};

Main.displayName = 'Main';
