let token: string | null = null

export const getAuthToken = (): string | null => token

export const setAuthToken = (value: string | null): void => {
  token = value
}
