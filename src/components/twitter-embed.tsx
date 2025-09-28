import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface TwitterEmbedProps {
  username: string;
  tweetId: string;
}

interface Twttr {
  widgets: { load: (element?: HTMLElement) => void };
}

declare global {
  interface Window {
    twttr?: Twttr;
  }
}

export const TwitterEmbed = ({ username, tweetId }: TwitterEmbedProps) => {
  const tweetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // Function to load the Twitter widgets script
    const loadTwitterScript = () => {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = () => {
        // Ensure the global twttr object is available
        if (window?.twttr?.widgets && tweetRef.current) {
          window.twttr.widgets.load(tweetRef.current);
        }
      };
      document.body.appendChild(script);
    };

    // Check if the Twitter widgets script is already present
    const isScriptPresent = document.querySelector(
      `script[src="https://platform.twitter.com/widgets.js"]`,
    );

    if (isScriptPresent) {
      // If script is already present, load the widget
      if (window?.twttr?.widgets && tweetRef.current) {
        window.twttr.widgets.load(tweetRef.current);
      }
    } else {
      // If script is not present, load it
      loadTwitterScript();
    }

    // MutationObserver to detect the addition of "twitter-tweet-rendered" class
    const observer = new MutationObserver(() => {
      const tweetElement = tweetRef.current?.querySelector('.twitter-tweet');
      if (tweetElement?.classList.contains('twitter-tweet-rendered')) {
        // Add a delay before setting isLoading to false
        setTimeout(() => {
          setIsLoading(false); // Stop loading once the tweet is fully rendered
          observer.disconnect(); // Disconnect observer as it's no longer needed
        }, 1000);
      }
    });

    if (tweetRef.current) {
      observer.observe(tweetRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [tweetId]);

  const getTweetWidth = () => {
    const width = window.innerWidth - 112; // Subtract 56px padding on both sides
    return width < 250 ? 250 : width > 550 ? 550 : width; // Min 250px, Max 550px
  };

  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  if (typeof window === 'undefined') return <div />;

  return (
    <div className='relative'>
      {isLoading && (
        <div className='flex min-h-[140px] items-center justify-center py-4'>
          <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
        </div>
      )}

      {/* Twitter Embed - hide during loading to avoid showing raw HTML */}
      <div ref={tweetRef} className={isLoading ? 'hidden' : ''}>
        <blockquote
          className='twitter-tweet'
          data-theme={getEffectiveTheme()}
          data-width={getTweetWidth()}
          data-conversation='none'
          data-align='center'
        >
          <a href={`https://twitter.com/${username}/status/${tweetId}`} />
        </blockquote>
      </div>
    </div>
  );
};
