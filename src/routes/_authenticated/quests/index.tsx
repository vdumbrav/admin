import { createFileRoute } from '@tanstack/react-router';
import { requireSupportOrAdminBeforeLoad } from '@/auth/guards';
import { Quests } from '@/features/quests';

export const Route = createFileRoute('/_authenticated/quests/')({
  beforeLoad: requireSupportOrAdminBeforeLoad,
  component: Quests,
  staticData: { title: 'Quests', breadcrumb: 'Quests' },
});
