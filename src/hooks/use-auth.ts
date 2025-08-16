import { useAuthStore } from '@/stores/authStore'

interface AuthResult {
  user: { roles: string[] } | null
  isLoading: boolean
}

export function useAuth(): AuthResult {
  const role = useAuthStore(s => s.role)
  return { user: { roles: [role] }, isLoading: false }
}
