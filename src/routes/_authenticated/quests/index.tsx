import { createFileRoute } from '@tanstack/react-router';
import { requireSupportOrAdminBeforeLoad } from '@/auth/guards';
import { parseQuestSearch } from '@/features/quests/default-search';
import { Quests } from '@/features/quests';

export const Route = createFileRoute('/_authenticated/quests/')({
  beforeLoad: requireSupportOrAdminBeforeLoad,
  validateSearch: parseQuestSearch,
  component: Quests,
  staticData: { title: 'Quests', breadcrumb: 'Quests' },
});
