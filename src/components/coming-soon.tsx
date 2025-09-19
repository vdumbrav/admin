import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({
  title = 'Coming Soon',
  description = 'This feature is coming soon! Stay tuned for updates.',
}: ComingSoonProps) {
  return (
    <div className='flex min-h-[50vh] items-center justify-center p-4'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <CardTitle className='text-2xl'>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className='text-base'>{description}</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
