import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/theme-context';
import { generateMetabaseUrl } from '@/lib/metabase';
import { Card, CardContent } from '@/components/ui/card';
import { IconRefresh } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/analytics/metabase')({
  component: MetabasePage,
});

function MetabasePage() {
  const { theme } = useTheme();
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Determine effective theme (resolve 'system' to actual theme)
    let effectiveTheme: 'dark' | 'light' = 'light';

    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = systemPrefersDark ? 'dark' : 'light';
    } else {
      effectiveTheme = theme === 'dark' ? 'dark' : 'light';
    }

    // Generate new URL when theme changes or component mounts
    const metabaseTheme = effectiveTheme === 'dark' ? 'night' : 'light';

    const url = generateMetabaseUrl({
      dashboardId: 2,
      theme: metabaseTheme,
      bordered: true,
      titled: true,
    });
    setIframeUrl(url);
  }, [theme, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metabase Analytics</h1>
          <p className="text-muted-foreground">
            Advanced analytics dashboard powered by Metabase
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <IconRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Metabase Embed */}
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          {iframeUrl && (
            <iframe
              key={refreshKey}
              src={iframeUrl}
              className="w-full rounded-lg"
              style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
              frameBorder="0"
              allowTransparency
              title="Metabase Analytics Dashboard"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
