import {
  TaskResponseDtoGroup as ApiGroup,
  TaskResponseDtoProvider as ApiProvider,
  WaitlistTasksResponseDtoTypeItem as ApiTypeItem,
  type TaskResponseDtoGroup,
  type TaskResponseDtoProvider,
  type WaitlistTasksResponseDtoTypeItem,
} from '@/lib/api/generated/model';

export function getAvailableApiTypes(): WaitlistTasksResponseDtoTypeItem[] {
  return Object.values(ApiTypeItem);
}

export function getJoinPresetTypes(): WaitlistTasksResponseDtoTypeItem[] {
  // Only types available for join preset: join (with verification) and dummy (without verification)
  return [ApiTypeItem.join, ApiTypeItem.dummy];
}

export function getAvailableApiProviders(): TaskResponseDtoProvider[] {
  return Object.values(ApiProvider);
}

export function getAvailableApiGroups(): TaskResponseDtoGroup[] {
  return Object.values(ApiGroup);
}
