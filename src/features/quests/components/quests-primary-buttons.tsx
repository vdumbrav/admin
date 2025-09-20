import { Link } from '@tanstack/react-router';
import { IconPlus } from '@tabler/icons-react';
import { useAppAuth } from '@/auth/hooks';
import { Button } from '@/components/ui/button';

export const QuestsPrimaryButtons = () => {
  const auth = useAppAuth();
  const listSearch = {
    search: '',
    group: 'all',
    type: '',
    provider: '',
    visible: '',
    page: 1,
    limit: 20,
    sort: 'order_by:asc',
    showForm: false,
  } as const;
  if (!auth.isAdmin) return null;
  return (
    <Button asChild className='space-x-1'>
      <Link to='/quests/new' search={listSearch}>
        <span>Create</span>
        <IconPlus size={18} />
      </Link>
    </Button>
  );
};
