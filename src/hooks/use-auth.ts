import { useAuthStore } from '@/stores/authStore'

interface AuthResult {
  user: { roles: string[] } | null
  isLoading: boolean
}

export const useAuth = (): AuthResult => {
  const role = useAuthStore((s) => s.role)
  return { user: { roles: [role] }, isLoading: false }
}

export const getAuth = (): { user: { roles: string[] } | null } => {
  const role = useAuthStore.getState().role
  return { user: { roles: [role] } }
}
