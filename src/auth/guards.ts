import { redirect } from '@tanstack/react-router'
import { userManager } from '@/auth/oidc'
import { hasAdminRole } from './roles'
import { defaultQuestSearch } from '@/features/quests/default-search'
import { logError } from '@/utils/log'

export const requireAdminBeforeLoad = async () => {
  if (import.meta.env.VITE_USE_FAKE_AUTH === 'true') return
  try {
    const user = await userManager.getUser()
    if (!user?.profile || !hasAdminRole(user.profile)) {
      logError('Admin role required', user?.profile)
      throw redirect({ to: '/quests', replace: true, search: defaultQuestSearch })
    }
  } catch (e) {
    logError('Admin guard failed', e)
    throw redirect({ to: '/quests', replace: true, search: defaultQuestSearch })
  }
}
