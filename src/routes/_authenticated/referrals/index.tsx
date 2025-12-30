import { createFileRoute } from '@tanstack/react-router';
import { ReferralsPage } from '@/features/referrals';

export const Route = createFileRoute('/_authenticated/referrals/')({
  component: ReferralsPage,
});
