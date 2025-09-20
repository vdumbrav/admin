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
  const baseClasses =
    'inline-flex items-center px-2.5 py-1 text-xs font-semibold leading-4 rounded-full border whitespace-nowrap transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  switch (variant) {
    case 'social':
    case 'daily':
    case 'referral':
    case 'partner':
      return `${baseClasses} badge-${variant}`;
    case 'default':
      return `${baseClasses} bg-secondary text-secondary-foreground border-border`;
  }
};

export const getBadgeStyle = (variant: BadgeVariant): React.CSSProperties => {
  switch (variant) {
    case 'social':
      return {
        backgroundColor: 'var(--badge-social)',
        color: 'var(--badge-social-foreground)',
        borderColor: 'var(--badge-social-border)',
      };
    case 'daily':
      return {
        backgroundColor: 'var(--badge-daily)',
        color: 'var(--badge-daily-foreground)',
        borderColor: 'var(--badge-daily-border)',
      };
    case 'referral':
      return {
        backgroundColor: 'var(--badge-referral)',
        color: 'var(--badge-referral-foreground)',
        borderColor: 'var(--badge-referral-border)',
      };
    case 'partner':
      return {
        backgroundColor: 'var(--badge-partner)',
        color: 'var(--badge-partner-foreground)',
        borderColor: 'var(--badge-partner-border)',
      };
    case 'default':
      return {};
  }
};
