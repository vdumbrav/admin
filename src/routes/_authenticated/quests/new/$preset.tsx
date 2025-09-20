import { createFileRoute } from '@tanstack/react-router';
import { requireAdminBeforeLoad } from '@/auth/guards';
import { QuestCreateWithPresetPage } from '@/features/quests/pages';

// Trust preset id; page will handle unknown ids via config lookup

export const Route = createFileRoute('/_authenticated/quests/new/$preset')({
  beforeLoad: async () => {
    // First check auth
    await requireAdminBeforeLoad();
  },
  component: QuestCreateWithPresetPage,
  staticData: {
    title: 'New Quest',
    breadcrumb: 'New Quest',
  },
});
