import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Spinner } from '@radix-ui/themes';

interface FormValues {
  resources?: {
    username?: string;
    tweetId?: string;
  };
}

// Mock tweet data for demonstration
const MOCK_TWEETS = {
  '1234567890': {
    id: '1234567890',
    text: 'Join our waitlist for early access to amazing features! 🚀\n\n#waitlist #startup #tech',
    author: {
      name: 'Waitlist App',
      username: 'waitlist',
      profile_image_url: 'https://unavatar.io/twitter/waitlist',
    },
    public_metrics: {
      retweet_count: 42,
      like_count: 156,
      reply_count: 23,
      quote_count: 8,
    },
    created_at: '2025-01-19T10:30:00.000Z',
  },
  '9876543210': {
    id: '9876543210',
    text: "Building in public! Here's what we've shipped this week:\n\n✅ New dashboard design\n✅ Mobile improvements\n✅ Bug fixes\n\nWhat should we work on next?",
    author: {
      name: 'Waitlist App',
      username: 'waitlist',
      profile_image_url: 'https://unavatar.io/twitter/waitlist',
    },
    public_metrics: {
      retweet_count: 28,
      like_count: 89,
      reply_count: 15,
      quote_count: 4,
    },
    created_at: '2025-01-18T14:20:00.000Z',
  },
};

interface TwitterPreviewState {
  loading: boolean;
  error: string | null;
  tweetData: {
    id: string;
    text: string;
    author: {
      name: string;
      username: string;
      profile_image_url: string;
    };
    public_metrics: {
      retweet_count: number;
      like_count: number;
      reply_count: number;
      quote_count: number;
    };
    created_at: string;
  } | null;
}

export const TwitterPreview = () => {
  const { control } = useFormContext<FormValues>();
  const username = useWatch({ control, name: 'resources.username' });
  const tweetId = useWatch({ control, name: 'resources.tweetId' });

  const [previews, setPreviews] = useState<Record<string, TwitterPreviewState>>({});

  // Check if we have twitter data to preview
  const hasTwitterData = !!(username && tweetId);

  useEffect(() => {
    // Skip if no data or feature disabled
    if (!hasTwitterData || import.meta.env.VITE_DISABLE_TWEET_PREVIEW === 'true') {
      return;
    }

    if (!tweetId) return;

    // Reset state for new tweet ID (clear previous data)
    setPreviews((prev) => ({
      ...prev,
      [tweetId]: { loading: true, error: null, tweetData: null },
    }));

    // Simulate API call with timeout
    const timeoutId = setTimeout(() => {
      const mockTweet = MOCK_TWEETS[tweetId as keyof typeof MOCK_TWEETS];

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (mockTweet) {
        setPreviews((prev) => ({
          ...prev,
          [tweetId]: { loading: false, error: null, tweetData: mockTweet },
        }));
      } else {
        setPreviews((prev) => ({
          ...prev,
          [tweetId]: {
            loading: false,
            error: 'Tweet not found or not available in preview',
            tweetData: null,
          },
        }));
      }
    }, 1500); // 1.5 second delay to simulate network

    return () => clearTimeout(timeoutId);
  }, [hasTwitterData, tweetId]);

  if (!hasTwitterData) {
    return null;
  }

  // Skip if feature is disabled
  if (import.meta.env.VITE_DISABLE_TWEET_PREVIEW === 'true') {
    return (
      <div className='space-y-4'>
        <div className='rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600'>
          Twitter preview is disabled (VITE_DISABLE_TWEET_PREVIEW=true)
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-sm font-medium'>Twitter Preview</h3>
        <p className='text-muted-foreground text-xs'>
          Preview of tweet @{username}/{tweetId} (mock data)
        </p>
      </div>

      <div className='space-y-4'>
        <div className='rounded-md border p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-xs font-medium'>
              Username: @{username} • Tweet ID: {tweetId}
            </span>
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
            {previews[tweetId]?.loading && (
              <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                <Spinner size='1' />
                Loading...
              </div>
            )}
          </div>

          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {previews[tweetId]?.loading && (
            <div className='bg-muted flex h-32 items-center justify-center rounded-md'>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Spinner size='2' />
                Fetching tweet preview...
              </div>
            </div>
          )}

          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {previews[tweetId]?.error && (
            <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
              {previews[tweetId].error}
              <div className='mt-1 text-xs text-red-600'>
                Try using one of these mock tweet IDs: 1234567890, 9876543210
              </div>
            </div>
          )}

          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {previews[tweetId]?.tweetData && (
            <div className='rounded-md border bg-white p-4'>
              <div className='flex items-start gap-3'>
                <img
                  src={previews[tweetId].tweetData.author.profile_image_url}
                  alt={previews[tweetId].tweetData.author.name}
                  className='h-10 w-10 rounded-full'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{previews[tweetId].tweetData.author.name}</span>
                    <span className='text-muted-foreground'>
                      @{previews[tweetId].tweetData.author.username}
                    </span>
                    <span className='text-muted-foreground'>·</span>
                    <span className='text-muted-foreground text-sm'>
                      {new Date(previews[tweetId].tweetData.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='mt-2 text-sm whitespace-pre-wrap'>
                    {previews[tweetId].tweetData.text}
                  </div>
                  <div className='text-muted-foreground mt-3 flex gap-6 text-sm'>
                    <span>💬 {previews[tweetId].tweetData.public_metrics.reply_count}</span>
                    <span>🔄 {previews[tweetId].tweetData.public_metrics.retweet_count}</span>
                    <span>❤️ {previews[tweetId].tweetData.public_metrics.like_count}</span>
                    <span>🔗 {previews[tweetId].tweetData.public_metrics.quote_count}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800'>
        <div className='font-medium'>Mock Preview</div>
        <div className='mt-1 text-xs text-blue-600'>
          This is a mock preview for development. Available mock tweet IDs: 1234567890, 9876543210
        </div>
      </div>
    </div>
  );
};
