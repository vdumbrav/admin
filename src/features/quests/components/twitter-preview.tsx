import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TwitterEmbed } from '@/components/twitter-embed';

interface FormValues {
  resources?: {
    username?: string;
    tweetId?: string;
  };
}

interface TwitterCardProps {
  username: string;
  tweetId: string;
}

interface TwitterPreviewProps {
  username?: string;
  tweetId?: string;
}

export const TwitterPreview = ({
  username: propsUsername,
  tweetId: propsTweetId,
}: TwitterPreviewProps = {}) => {
  const { control } = useFormContext<FormValues>();
  const formUsername = useWatch({ control, name: 'resources.username' });
  const formTweetId = useWatch({ control, name: 'resources.tweetId' });

  // Use props if provided, otherwise fall back to form values
  const username = propsUsername ?? formUsername;
  const tweetId = propsTweetId ?? formTweetId;

  const [showPreview, setShowPreview] = useState(true);

  // Check if we have twitter data to preview
  const hasTwitterData = !!(username && tweetId && username.trim() && tweetId.trim());

  if (!hasTwitterData) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium'>Twitter Card Preview</h3>
          <p className='text-muted-foreground text-xs'>
            Preview: @{username} • Tweet ID: {tweetId}
          </p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => setShowPreview(!showPreview)}
          className='flex items-center gap-2'
        >
          {showPreview ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
          {showPreview ? 'Hide' : 'Show'}
        </Button>
      </div>

      {showPreview && <TwitterCard username={username} tweetId={tweetId} />}
    </div>
  );
};

// Simple Twitter Card Component
const TwitterCard = ({ username, tweetId }: TwitterCardProps) => {
  return (
    <div className='bg-card text-card-foreground rounded-md border p-4'>
      <TwitterEmbed username={username} tweetId={tweetId} />
    </div>
  );
};
