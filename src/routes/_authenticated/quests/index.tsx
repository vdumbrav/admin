import { createFileRoute } from '@tanstack/react-router';
import { Quests } from '@/features/quests';
import { parseQuestSearch } from '@/features/quests/default-search';

export const Route = createFileRoute('/_authenticated/quests/')({
  validateSearch: parseQuestSearch,
  component: Quests,
  staticData: { title: 'Quests', breadcrumb: 'Quests' },
});
