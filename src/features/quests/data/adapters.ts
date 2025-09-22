import {
  TaskResponseDtoGroup as ApiGroup,
  TaskResponseDtoProvider as ApiProvider,
  TaskResponseDtoTypeItem as ApiTypeItem,
  type TaskResponseDtoGroup,
  type TaskResponseDtoProvider,
  type TaskResponseDtoTypeItem,
} from '@/lib/api/generated/model';

export function getAvailableApiTypes(): TaskResponseDtoTypeItem[] {
  return Object.values(ApiTypeItem);
}

export function getAvailableApiProviders(): TaskResponseDtoProvider[] {
  return Object.values(ApiProvider);
}

export function getAvailableApiGroups(): TaskResponseDtoGroup[] {
  return Object.values(ApiGroup);
}
