export const defaultQuestSearch = {
  search: '',
  group: '',
  type: '',
  provider: '',
  enabled: '',
  page: 1,
  limit: 20,
  sort: 'order_by:asc',
  showForm: false,
} as const;

const parseBool = (v: unknown, def = false): boolean => {
  if (v === true || v === 'true' || v === 1 || v === '1') return true;
  if (v === false || v === 'false' || v === 0 || v === '0') return false;
  return def;
};

export const parseQuestSearch = (search: Record<string, unknown>) => ({
  search: (search.search as string) || defaultQuestSearch.search,
  group: (search.group as string) || defaultQuestSearch.group,
  type: (search.type as string) || defaultQuestSearch.type,
  provider: (search.provider as string) || defaultQuestSearch.provider,
  enabled: (search.enabled as string) || defaultQuestSearch.enabled,
  page: Number(search.page ?? defaultQuestSearch.page),
  limit: Number(search.limit ?? defaultQuestSearch.limit),
  sort: (search.sort as string) || defaultQuestSearch.sort,
  showForm: parseBool(search.showForm, defaultQuestSearch.showForm),
});

export type QuestSearch = ReturnType<typeof parseQuestSearch>;
