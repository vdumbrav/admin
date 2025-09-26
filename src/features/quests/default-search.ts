export const defaultQuestSearch = {
  search: '',
  group: '',
  type: '',
  provider: '',
  enabled: '',
  page: 1,
  limit: 20,
  sort: 'id:desc',
  showForm: false,
} as const;

const parseBool = (v: unknown, def = false): boolean => {
  if (v === true || v === 'true' || v === 1 || v === '1') return true;
  if (v === false || v === 'false' || v === 0 || v === '0') return false;
  return def;
};

const parseString = (v: unknown, def: string): string => {
  return typeof v === 'string' ? v : def;
};

const parseNumber = (v: unknown, def: number): number => {
  const num = Number(v);
  return !Number.isNaN(num) && num > 0 ? num : def;
};

// More type-safe search parameter parser
export const parseQuestSearch = (search: Record<string, unknown>) => ({
  search: parseString(search.search, defaultQuestSearch.search),
  group: parseString(search.group, defaultQuestSearch.group),
  type: parseString(search.type, defaultQuestSearch.type),
  provider: parseString(search.provider, defaultQuestSearch.provider),
  enabled: parseString(search.enabled, defaultQuestSearch.enabled),
  page: parseNumber(search.page, defaultQuestSearch.page),
  limit: parseNumber(search.limit, defaultQuestSearch.limit),
  sort: parseString(search.sort, defaultQuestSearch.sort),
  showForm: parseBool(search.showForm, defaultQuestSearch.showForm),
});

export type QuestSearch = ReturnType<typeof parseQuestSearch>;

// Ensure all search parameters have valid defaults
export function ensureValidQuestSearch(search: Partial<QuestSearch>): QuestSearch {
  return {
    search: search.search ?? defaultQuestSearch.search,
    group: search.group ?? defaultQuestSearch.group,
    type: search.type ?? defaultQuestSearch.type,
    provider: search.provider ?? defaultQuestSearch.provider,
    enabled: search.enabled ?? defaultQuestSearch.enabled,
    page: search.page ?? defaultQuestSearch.page,
    limit: search.limit ?? defaultQuestSearch.limit,
    sort: search.sort ?? defaultQuestSearch.sort,
    showForm: search.showForm ?? defaultQuestSearch.showForm,
  };
}

// Create search params for navigation with optional overrides
export function createQuestSearch(overrides: Partial<QuestSearch> = {}): QuestSearch {
  return ensureValidQuestSearch(overrides);
}
