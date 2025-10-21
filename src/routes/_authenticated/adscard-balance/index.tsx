import { createFileRoute } from '@tanstack/react-router';
import { AdscardBalancePage } from '@/features/adscard-balance';

export const Route = createFileRoute('/_authenticated/adscard-balance/')({
  component: AdscardBalancePage,
});
