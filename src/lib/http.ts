export type HttpInit = RequestInit & { token?: string }

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined
if (!rawApiUrl) {
  throw new Error('VITE_API_URL is not defined')
}
const API_URL = rawApiUrl
const APP_BASE = import.meta.env.BASE_URL

export const http = async <T>(path: string, init: HttpInit = {}): Promise<T> => {
  const { token, headers, body, ...rest } = init
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    },
    body,
  })

  if (res.status === 401) {
    window.location.replace(`${APP_BASE}sign-in`)
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204) {
    return undefined as T
  }
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) {
    return (await res.json()) as T
  }
  return (await res.text()) as unknown as T
}
