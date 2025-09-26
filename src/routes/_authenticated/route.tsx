import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/role-guard';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';

function AuthenticatedRoute() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout />
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedRoute,
});
