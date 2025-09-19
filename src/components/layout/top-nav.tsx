import { useAppAuth } from '@/auth/hooks';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';

export function TopNav() {
  const auth = useAppAuth();

  return (
    <header className='bg-background border-b px-6 py-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <h1 className='text-lg font-semibold'>Waitlist Admin</h1>
        </div>

        <div className='flex items-center space-x-4'>
          <ThemeSwitch />
          {auth.isAuthenticated && <ProfileDropdown />}
        </div>
      </div>
    </header>
  );
}
