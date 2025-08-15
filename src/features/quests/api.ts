import * as mock from './api.mock'
import * as server from './api.server'

const useFake = import.meta.env.VITE_USE_FAKE_API === 'true'

export const useQuests = useFake ? mock.useQuests : server.useQuests
export const useQuest = useFake ? mock.useQuest : server.useQuest
export const useCreateQuest = useFake ? mock.useCreateQuest : server.useCreateQuest
export const useUpdateQuest = useFake ? mock.useUpdateQuest : server.useUpdateQuest
export const useDeleteQuest = useFake ? mock.useDeleteQuest : server.useDeleteQuest
export const useToggleVisibility = useFake ? mock.useToggleVisibility : server.useToggleVisibility
export const uploadMedia = useFake ? mock.uploadMedia : server.uploadMedia
