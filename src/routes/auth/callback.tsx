import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'
import { defaultQuestSearch } from '@/features/quests/default-search'

export const Route = createFileRoute('/auth/callback')({
  component: CallbackPage,
})

function CallbackPage() {
  const { isAuthenticated, isLoading, hasAllowedRole, error } = useAppAuth()

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <div className='border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-muted-foreground'>Completing sign in...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <Navigate to='/sign-in' replace />
  }

  if (isAuthenticated && hasAllowedRole) {
    return <Navigate to='/quests' search={defaultQuestSearch} replace />
  }

  return <Navigate to='/sign-in' replace />
}
