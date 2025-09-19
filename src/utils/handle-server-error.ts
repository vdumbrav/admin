import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { logError } from './log';

export function handleServerError(error: unknown) {
  logError(error);

  let errMsg = 'Something went wrong!';

  if (error && typeof error === 'object' && 'status' in error && Number(error.status) === 204) {
    errMsg = 'Content not found.';
  }

  if (error instanceof AxiosError) {
    errMsg = error.response?.data.title;
  }

  toast.error(errMsg);
}
