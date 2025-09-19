import { createFileRoute, redirect } from '@tanstack/react-router';
import { requireAdminBeforeLoad } from '@/auth/guards';
import { toast } from 'sonner';
import { parseQuestSearch, defaultQuestSearch } from '@/features/quests/default-search';
import { QuestCreateWithPresetPage } from '@/features/quests/pages';
import { isValidPresetId } from '@/features/quests/presets';

export const Route = createFileRoute('/_authenticated/quests/new/$preset')({
  beforeLoad: async ({ params }) => {
    // First check auth
    await requireAdminBeforeLoad();

    // Then validate preset
    if (!isValidPresetId(params.preset)) {
      toast.error('Unknown preset, please select from available options');
      throw redirect({
        to: '/quests/new',
        search: defaultQuestSearch,
      });
    }
  },
  validateSearch: parseQuestSearch,
  component: QuestCreateWithPresetPage,
  staticData: {
    title: 'New Quest',
    breadcrumb: 'New Quest',
  },
});
