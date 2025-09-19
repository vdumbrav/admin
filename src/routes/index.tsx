import { createFileRoute, redirect } from '@tanstack/react-router';
import { defaultQuestSearch } from '@/features/quests/default-search';

export const Route = createFileRoute('/')({
  loader: () => {
    throw redirect({ to: '/quests', search: defaultQuestSearch });
  },
});
