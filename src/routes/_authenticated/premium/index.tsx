import { createFileRoute } from '@tanstack/react-router';
import { PremiumPage } from '@/features/premium';

export const Route = createFileRoute('/_authenticated/premium/')({
  component: PremiumPage,
});
