import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@radix-ui/themes';

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
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReady(false);
    const container = ref.current;
    if (!container) return;
    container.innerHTML = '';

    const blockquote = document.createElement('blockquote');
    blockquote.className = 'twitter-tweet';
    const link = document.createElement('a');
    link.href = `https://twitter.com/${username}/status/${tweetId}`;
    blockquote.appendChild(link);
    container.appendChild(blockquote);

    const timeout = setTimeout(() => setReady(true), 7000);

    if (window.twttr?.widgets) {
      window.twttr.widgets.load(container);
      setReady(true);
      return () => clearTimeout(timeout);
    }

    const scriptId = 'twitter-wjs';
    const existing = document.getElementById(scriptId);
    const load = () => {
      window.twttr?.widgets.load(container);
      setReady(true);
    };
    if (!existing) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = load;
      container.appendChild(script);
    } else {
      load();
    }

    return () => clearTimeout(timeout);
  }, [username, tweetId]);

  if (typeof window === 'undefined') return <div />;

  return (
    <div>
      {!ready && (
        <div className='flex min-h-[140px] items-center justify-center py-4'>
          <Spinner />
        </div>
      )}
      <div ref={ref} />
    </div>
  );
};
