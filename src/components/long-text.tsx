import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LongTextProps {
  children: string;
  maxLength?: number;
  className?: string;
}

export function LongText({ children, maxLength = 100, className }: LongTextProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (children.length <= maxLength) {
    return <span className={className}>{children}</span>;
  }

  const truncatedText = children.slice(0, maxLength);

  return (
    <div className={className}>
      <span>{isExpanded ? children : `${truncatedText}...`}</span>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsExpanded(!isExpanded)}
        className='ml-2 h-auto p-0 text-xs'
      >
        {isExpanded ? (
          <>
            Show less <ChevronUp className='ml-1 h-3 w-3' />
          </>
        ) : (
          <>
            Show more <ChevronDown className='ml-1 h-3 w-3' />
          </>
        )}
      </Button>
    </div>
  );
}
