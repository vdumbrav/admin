import { useAuth } from 'react-oidc-context'

export function useApiFetch() {
  const auth = useAuth()
  const base = import.meta.env.VITE_API_URL as string

  return async function apiFetch<T>(
    path: string,
    init: RequestInit & { asFormData?: boolean } = {}
  ): Promise<T> {
    const token = await auth.user?.access_token
    const headers = new Headers(init.headers)

    const isForm = (init as { asFormData?: boolean }).asFormData
    if (!isForm) headers.set('Content-Type', 'application/json')
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const res = await fetch(`${base}${path}`, {
      ...init,
      headers,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `${res.status} ${res.statusText}`)
    }
    if (res.status === 204) return undefined as unknown as T
    return (await res.json()) as T
  }
}
