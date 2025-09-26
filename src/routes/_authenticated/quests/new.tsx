import { createFileRoute } from '@tanstack/react-router';
import { parseQuestSearch } from '@/features/quests/default-search';
import { QuestCreatePage } from '@/features/quests/pages';

export const Route = createFileRoute('/_authenticated/quests/new')({
  validateSearch: parseQuestSearch,
  component: QuestCreatePage,
  staticData: { title: 'New Quest', breadcrumb: 'New Quest' },
});
