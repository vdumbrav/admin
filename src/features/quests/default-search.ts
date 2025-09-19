export const defaultQuestSearch = {
  search: '',
  group: 'all',
  type: '',
  provider: '',
  visible: '',
  page: 1,
  limit: 20,
  sort: 'order_by:asc',
} as const;

export const parseQuestSearch = (search: Record<string, unknown>) => ({
  search: (search.search as string) ?? defaultQuestSearch.search,
  group: (search.group as string) ?? defaultQuestSearch.group,
  type: (search.type as string) ?? defaultQuestSearch.type,
  provider: (search.provider as string) ?? defaultQuestSearch.provider,
  visible: (search.visible as string) ?? defaultQuestSearch.visible,
  page: Number(search.page ?? defaultQuestSearch.page),
  limit: Number(search.limit ?? defaultQuestSearch.limit),
  sort: (search.sort as string) ?? defaultQuestSearch.sort,
});

export type QuestSearch = ReturnType<typeof parseQuestSearch>;
