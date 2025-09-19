import { Link } from '@tanstack/react-router';
import { IconPlus } from '@tabler/icons-react';
import { useAppAuth } from '@/auth/provider';
import { Button } from '@/components/ui/button';
import { useQuestSearch } from '../use-quest-search';

export const QuestsPrimaryButtons = () => {
  const auth = useAppAuth();
  const search = useQuestSearch({ from: '/_authenticated/quests/' as const });
  if (!auth.isAdmin) return null;
  return (
    <Button asChild className='space-x-1'>
      <Link to='/quests/new' search={search}>
        <span>Create</span>
        <IconPlus size={18} />
      </Link>
    </Button>
  );
};
