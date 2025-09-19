import { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Spinner } from '@radix-ui/themes';
import { TwitterEmbed } from '@/components/twitter-embed';

interface FormValues {
  tasks?: Array<{
    resources?: {
      tweetId?: string;
      username?: string;
    };
    type?: string;
    provider?: string;
  }>;
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
    text: 'Building in public! Here\'s what we\'ve shipped this week:\n\n✅ New dashboard design\n✅ Mobile improvements\n✅ Bug fixes\n\nWhat should we work on next?',
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
  tweetData: any | null;
}

export const TwitterPreview = () => {
  const { control } = useFormContext<FormValues>();
  const tasks = useWatch({ control, name: 'tasks' });

  const [previews, setPreviews] = useState<Record<string, TwitterPreviewState>>({});

  // Find tasks with twitter provider and tweetId
  const twitterTasks = (tasks || []).filter(
    (task) => task?.provider === 'twitter' && task?.resources?.tweetId
  );

  useEffect(() => {
    twitterTasks.forEach((task) => {
      const tweetId = task.resources?.tweetId;
      if (!tweetId || previews[tweetId]) return;

      // Set loading state
      setPreviews((prev) => ({
        ...prev,
        [tweetId]: { loading: true, error: null, tweetData: null },
      }));

      // Simulate API call with timeout
      const timeoutId = setTimeout(() => {
        const mockTweet = MOCK_TWEETS[tweetId as keyof typeof MOCK_TWEETS];

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
              tweetData: null
            },
          }));
        }
      }, 1500); // 1.5 second delay to simulate network

      return () => clearTimeout(timeoutId);
    });
  }, [twitterTasks, previews]);

  if (twitterTasks.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-sm font-medium'>Twitter Preview</h3>
        <p className='text-xs text-muted-foreground'>
          Preview of tweets referenced in tasks (mock data)
        </p>
      </div>

      <div className='space-y-4'>
        {twitterTasks.map((task, index) => {
          const tweetId = task.resources?.tweetId;
          if (!tweetId) return null;

          const preview = previews[tweetId];
          const taskType = task.type;

          return (
            <div key={index} className='rounded-md border p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>
                  Task: {taskType} • Tweet ID: {tweetId}
                </span>
                {preview?.loading && (
                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <Spinner size='1' />
                    Loading...
                  </div>
                )}
              </div>

              {preview?.loading && (
                <div className='flex h-32 items-center justify-center rounded-md bg-muted'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Spinner size='2' />
                    Fetching tweet preview...
                  </div>
                </div>
              )}

              {preview?.error && (
                <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                  {preview.error}
                  <div className='mt-1 text-xs text-red-600'>
                    Try using one of these mock tweet IDs: 1234567890, 9876543210
                  </div>
                </div>
              )}

              {preview?.tweetData && (
                <div className='rounded-md border bg-white p-4'>
                  <div className='flex items-start gap-3'>
                    <img
                      src={preview.tweetData.author.profile_image_url}
                      alt={preview.tweetData.author.name}
                      className='h-10 w-10 rounded-full'
                    />
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold'>
                          {preview.tweetData.author.name}
                        </span>
                        <span className='text-muted-foreground'>
                          @{preview.tweetData.author.username}
                        </span>
                        <span className='text-muted-foreground'>·</span>
                        <span className='text-sm text-muted-foreground'>
                          {new Date(preview.tweetData.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='mt-2 whitespace-pre-wrap text-sm'>
                        {preview.tweetData.text}
                      </div>
                      <div className='mt-3 flex gap-6 text-sm text-muted-foreground'>
                        <span>💬 {preview.tweetData.public_metrics.reply_count}</span>
                        <span>🔄 {preview.tweetData.public_metrics.retweet_count}</span>
                        <span>❤️ {preview.tweetData.public_metrics.like_count}</span>
                        <span>🔗 {preview.tweetData.public_metrics.quote_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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