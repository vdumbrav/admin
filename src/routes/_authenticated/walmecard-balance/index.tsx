import { createFileRoute } from '@tanstack/react-router';
import { AdscardBalancePage } from '@/features/walmecard-balance';

export const Route = createFileRoute('/_authenticated/walmecard-balance/')({
  component: AdscardBalancePage,
});
