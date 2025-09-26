import * as React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const [activeTeam] = React.useState(teams[0]);
  const { open } = useSidebar();

  return (
    <div className='flex justify-start p-1'>
      {open ? (
        <activeTeam.logo variant='full' width={64} height={32} className='text-foreground' />
      ) : (
        <activeTeam.logo variant='minimal' width={32} height={32} className='text-foreground' />
      )}
    </div>
  );
}
