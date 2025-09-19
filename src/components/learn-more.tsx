import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LearnMoreProps {
  href: string;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
}

export function LearnMore({ href, children, variant = 'outline' }: LearnMoreProps) {
  return (
    <Button variant={variant} asChild>
      <a href={href} target='_blank' rel='noopener noreferrer' className='inline-flex items-center'>
        {children}
        <ExternalLink className='ml-2 h-4 w-4' />
      </a>
    </Button>
  );
}
