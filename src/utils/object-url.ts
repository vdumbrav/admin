export const replaceObjectUrl = (prev?: string, next?: Blob) => {
  if (prev) URL.revokeObjectURL(prev);
  return next ? URL.createObjectURL(next) : undefined;
};
