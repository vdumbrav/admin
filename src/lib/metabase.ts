export interface MetabaseEmbedOptions {
  dashboardId: number;
  theme?: 'light' | 'night';
  bordered?: boolean;
  titled?: boolean;
}

/**
 * Generate Metabase embed URL
 * Uses public dashboard URL with theme and display parameters
 */
export function generateMetabaseUrl(options: MetabaseEmbedOptions): string {
  const {
    dashboardId,
    theme = 'night',
    bordered = true,
    titled = true,
  } = options;

  const METABASE_SITE_URL = 'https://analytics.walme.io';

  // Construct URL with theme and display parameters as hash
  const hashParams = [];
  hashParams.push(`theme=${theme}`);
  if (bordered) hashParams.push('bordered=true');
  if (titled) hashParams.push('titled=true');

  return `${METABASE_SITE_URL}/public/dashboard/${dashboardId}#${hashParams.join('&')}`;
}
