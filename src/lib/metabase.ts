export interface MetabaseEmbedOptions {
  dashboardId: number;
  theme?: 'light' | 'night';
  bordered?: boolean;
  titled?: boolean;
}

/**
 * Generate Metabase embed URL via backend API
 * Backend signs the JWT token for secure embedding
 */
export async function generateMetabaseUrl(options: MetabaseEmbedOptions): Promise<string> {
  const {
    dashboardId,
    theme = 'night',
    bordered = true,
    titled = true,
  } = options;

  const API_URL = import.meta.env.VITE_API_URL || 'https://api2.moliedev.xyz';

  try {
    // Get auth token from localStorage (set by OIDC provider)
    const oidcStorage = localStorage.getItem(`oidc.user:${import.meta.env.VITE_OIDC_AUTHORITY}:${import.meta.env.VITE_OIDC_CLIENT_ID}`);
    const token = oidcStorage ? JSON.parse(oidcStorage).access_token : null;

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Call backend API to get signed embed URL
    const params = new URLSearchParams({
      dashboardId: dashboardId.toString(),
      theme,
      bordered: bordered.toString(),
      titled: titled.toString(),
    });

    const response = await fetch(`${API_URL}/metabase/embed-url?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Metabase embed URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.iframeUrl;
  } catch (error) {
    console.error('Error generating Metabase URL:', error);
    throw error;
  }
}
