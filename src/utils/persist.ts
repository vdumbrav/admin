export const LS_TABLE_VIS = 'WL/quests.table.visibility';
export const LS_TABLE_SIZE = 'WL/quests.table.pageSize';
export const LS_TABLE_SORT = 'WL/quests.table.sort';

export const loadJSON = <T>(k: string, f: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : f;
  } catch {
    return f;
  }
};
export const saveJSON = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    // ignore
  }
};
