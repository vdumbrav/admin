import * as mock from './api.mock'
import * as real from './api.real'

const useFake = import.meta.env.VITE_USE_FAKE_API === 'true'

export const useQuests = useFake ? mock.useQuests : real.useQuests
export const useQuest = useFake ? mock.useQuest : real.useQuest
export const useCreateQuest = useFake
  ? mock.useCreateQuest
  : real.useCreateQuest
export const useUpdateQuest = useFake
  ? mock.useUpdateQuest
  : real.useUpdateQuest
export const useDeleteQuest = useFake
  ? mock.useDeleteQuest
  : real.useDeleteQuest
export const useToggleVisibility = useFake
  ? mock.useToggleVisibility
  : real.useToggleVisibility
export const useBulkAction = useFake ? mock.useBulkAction : real.useBulkAction
export const uploadMedia = useFake ? mock.uploadMedia : real.uploadMedia
