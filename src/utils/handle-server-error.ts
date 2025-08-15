import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in (error as Record<string, unknown>) &&
    Number((error as { status?: unknown }).status) === 204
  ) {
    errMsg = 'Content not found.'
  } else if (error instanceof Error) {
    errMsg = error.message
  }

  toast.error(errMsg)
}
