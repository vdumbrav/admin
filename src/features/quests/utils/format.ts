import { format as fmt, parseISO } from 'date-fns';

export const formatNumberShort = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '–';
  const n = Number(value);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

export const formatDateDMY = (iso?: string | null): string => {
  if (!iso) return '–';
  try {
    const d = parseISO(iso);
    if (Number.isNaN(d.getTime())) return '–';
    return fmt(d, 'dd.MM.yyyy');
  } catch {
    return '–';
  }
};

export const formatXp = (n?: number | null): string => {
  if (n === null || n === undefined) return '–';
  return `${n} XP`;
};
