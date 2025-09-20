import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DomainWarningProps {
  title?: string;
  message: string;
}

export const DomainWarning = ({ title = 'Heads up', message }: DomainWarningProps) => {
  return (
    <Alert variant='default' className='border-yellow-200 bg-yellow-50'>
      <AlertTitle className='text-yellow-800'>{title}</AlertTitle>
      <AlertDescription className='text-yellow-800'>{message}</AlertDescription>
    </Alert>
  );
};
