/**
 * Domain matching utilities for Connect-gate rules
 */

// Provider domain mappings
const PROVIDER_DOMAINS: Record<string, string[]> = {
  twitter: ['x.com', 'twitter.com', 'mobile.twitter.com'],
  discord: ['discord.com', 'discord.gg', 'discordapp.com'],
  telegram: ['t.me', 'telegram.org', 'telegram.me'],
  matrix: ['matrix.org', 'element.io'],
  walme: ['walme.io'],
  monetag: ['monetag.com'],
  adsgram: ['adsgram.ai'],
};

/**
 * Check if host matches any domain in the list (supports suffixes)
 */
export function matchDomain(host: string, domains: string[]): boolean {
  const normalizedHost = host.toLowerCase().replace(/^www\./, '');

  return domains.some((domain) => {
    const normalizedDomain = domain.toLowerCase();
    return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
  });
}

/**
 * Extract normalized domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Get provider for domain
 */
export function getProviderForDomain(domain: string): string | null {
  for (const [provider, domains] of Object.entries(PROVIDER_DOMAINS)) {
    if (matchDomain(domain, domains)) {
      return provider;
    }
  }
  return null;
}

/**
 * Check if URL matches any social domains that might need Connect-gate
 */
export function isSocialDomain(url: string): boolean {
  const domain = extractDomain(url);
  if (!domain) return false;

  const socialProviders = ['twitter', 'discord', 'telegram'];

  for (const provider of socialProviders) {
    const domains = PROVIDER_DOMAINS[provider] ?? [];
    if (matchDomain(domain, domains)) {
      return true;
    }
  }

  return false;
}

/**
 * Get Connect-gate recommendation message for URL
 */
export function getConnectGateMessage(url: string): string | null {
  const domain = extractDomain(url);
  if (!domain) return null;

  const provider = getProviderForDomain(domain);
  if (!provider) return null;

  const providerMessages: Record<string, string> = {
    twitter: 'Consider adding a Connect Twitter quest first for better user flow',
    discord: 'Consider adding a Connect Discord quest first for better user flow',
    telegram: 'Consider adding a Connect Telegram quest first for better user flow',
  };

  return providerMessages[provider] || null;
}
