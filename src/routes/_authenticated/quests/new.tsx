import { createFileRoute } from '@tanstack/react-router';
import { requireAdminBeforeLoad } from '@/auth/guards';
import { QuestCreatePage } from '@/features/quests/pages';

export const Route = createFileRoute('/_authenticated/quests/new')({
  beforeLoad: requireAdminBeforeLoad,
  component: QuestCreatePage,
  staticData: { title: 'New Quest', breadcrumb: 'New Quest' },
});
