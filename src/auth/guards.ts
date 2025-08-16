import { redirect } from '@tanstack/react-router'
import { userManager } from '@/auth/oidc'
import { hasAdminRole } from './roles'

export const requireAdminBeforeLoad = async () => {
  if (import.meta.env.VITE_USE_FAKE_AUTH === 'true') return
  try {
    const user = await userManager.getUser()
    if (!user?.profile || !hasAdminRole(user.profile)) {
      throw redirect({ to: '/quests', replace: true })
    }
  } catch {
    throw redirect({ to: '/quests', replace: true })
  }
}
