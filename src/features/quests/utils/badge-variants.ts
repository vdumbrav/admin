export type BadgeVariant = 'social' | 'daily' | 'referral' | 'partner' | 'default';

export const getBadgeVariant = (group: string): BadgeVariant => {
  switch (group.toLowerCase()) {
    case 'social':
      return 'social';
    case 'daily':
      return 'daily';
    case 'referral':
      return 'referral';
    case 'partner':
      return 'partner';
    default:
      return 'default';
  }
};

export const getBadgeClasses = (variant: BadgeVariant): string => {
  const baseClasses = 'text-xs font-semibold leading-4 rounded-full border';

  switch (variant) {
    case 'social':
      return `${baseClasses} bg-[--badge-social] text-[--badge-social-foreground] border-[--badge-social]`;
    case 'daily':
      return `${baseClasses} bg-[--badge-daily] text-[--badge-daily-foreground] border-[--badge-daily]`;
    case 'referral':
      return `${baseClasses} bg-[--badge-referral] text-[--badge-referral-foreground] border-[--badge-referral]`;
    case 'partner':
      return `${baseClasses} bg-[--badge-partner] text-[--badge-partner-foreground] border-[--badge-partner]`;
    case 'default':
      return `${baseClasses} bg-secondary text-secondary-foreground`;
  }
};
