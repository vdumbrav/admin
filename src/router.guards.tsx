import { redirect } from '@tanstack/react-router'
import { useAppAuth } from '@/auth/provider'

export const useRequireAdmin = () => {
  const auth = useAppAuth()
  if (!auth.hasRole('admin')) {
    throw redirect({ to: '/quests' })
  }
}
