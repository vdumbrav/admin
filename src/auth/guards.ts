import { redirect } from '@tanstack/react-router'
import { userManager } from '@/auth/oidc'
import { logError } from '@/utils/log'
import { UserRole } from './roles'
import { getRolesFromUser, userHasAllowedRole, userIsAdmin } from './utils'

export const requireAuthBeforeLoad = async () => {
  let user
  try {
    user = await userManager.getUser()
  } catch (e) {
    logError('Auth guard failed to get user', e)
    throw redirect({ to: '/sign-in', replace: true })
  }

  if (!user) {
    throw redirect({ to: '/sign-in', replace: true })
  }

  const hasAccess = userHasAllowedRole(user)

  if (!hasAccess) {
    const roles = getRolesFromUser(user)
    logError('Insufficient role for access', {
      roles,
      requiredRoles: [UserRole.Admin, UserRole.Administrator, UserRole.Moderator, UserRole.Support],
    })
    throw redirect({ to: '/sign-in', replace: true })
  }
}

export const requireAdminBeforeLoad = async () => {
  let user
  try {
    user = await userManager.getUser()
  } catch (e) {
    logError('Admin guard failed to get user', e)
    throw redirect({ to: '/sign-in', replace: true })
  }

  if (!userIsAdmin(user)) {
    const roles = getRolesFromUser(user)
    logError('Admin role required', { roles })
    throw redirect({ to: '/sign-in', replace: true })
  }
}

export const requireSupportOrAdminBeforeLoad = async () => {
  await requireAuthBeforeLoad()
}
