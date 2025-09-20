import {
  IconAd,
  IconBrandDiscord,
  IconBrandMatrix,
  IconBrandTelegram,
  IconBrandX,
  IconServer,
  IconVideo,
} from '@tabler/icons-react';

export const getProviderIcon = (provider: string) => {
  const label = `${provider} provider`;
  const iconClass = 'text-foreground transition-colors hover:text-primary';

  switch (provider.toLowerCase()) {
    case 'twitter':
    case 'x':
      return <IconBrandX size={16} title={label} aria-label={label} className={iconClass} />;
    case 'telegram':
      return <IconBrandTelegram size={16} title={label} aria-label={label} className={iconClass} />;
    case 'discord':
      return <IconBrandDiscord size={16} title={label} aria-label={label} className={iconClass} />;
    case 'matrix':
      return <IconBrandMatrix size={16} title={label} aria-label={label} className={iconClass} />;
    case 'internal':
      return <IconServer size={16} title={label} aria-label={label} className={iconClass} />;
    case 'monetag':
      return <IconAd size={16} title={label} aria-label={label} className={iconClass} />;
    case 'adsgram':
      return <IconVideo size={16} title={label} aria-label={label} className={iconClass} />;
    default:
      return <IconServer size={16} title={label} aria-label={label} className={iconClass} />;
  }
};
