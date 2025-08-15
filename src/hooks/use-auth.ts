interface AuthResult {
  user: { roles: string[] } | null
  isLoading: boolean
}

export function useAuth(): AuthResult {
  return { user: { roles: ['admin'] }, isLoading: false }
}
