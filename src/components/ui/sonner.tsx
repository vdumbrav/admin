import { Toaster as Sonner, ToasterProps } from 'sonner';
import { useTheme } from '@/context/theme-context';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group [&_div[data-content]]:w-full'
      toastOptions={{
        classNames: {
          toast:
            'group-[.toaster]:border-border group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground',
          closeButton: 'group-[.toaster]:border-border group-[.toaster]:bg-background',
        },
      }}
      duration={3000}
      closeButton
      expand
      {...props}
    />
  );
};

export { Toaster };
