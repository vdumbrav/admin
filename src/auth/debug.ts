/**
 * Debug utilities for token inspection
 */

export const debugToken = (token: string | undefined, context: string = '') => {
  if (!token) {
    // eslint-disable-next-line no-console
    console.warn(`[${context}] No token available`)
    return
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      // eslint-disable-next-line no-console
      console.warn(`[${context}] Invalid token format`)
      return
    }

    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp && payload.exp < now
    const timeLeft = payload.exp ? payload.exp - now : 0

    // eslint-disable-next-line no-console
    console.log(`[${context}] Token debug:`, {
      isExpired,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown',
      timeLeft: timeLeft > 0 ? `${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s` : 'expired',
      roles: payload?.realm_access?.roles || [],
      clientRoles: payload?.resource_access || {},
      subject: payload.sub,
      audience: payload.aud,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[${context}] Failed to parse token:`, error)
  }
}