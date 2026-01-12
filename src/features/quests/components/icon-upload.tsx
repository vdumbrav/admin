import { useEffect, useRef, useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form';

interface IconUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const MAX_SIZE = 1024 * 1024; // 1MB

export const IconUpload = ({
  value,
  onChange,
  onClear,
  disabled,
  onImageUpload,
}: IconUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Track object URLs to prevent memory leaks
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => {
      const file = accepted[0];
      if (file) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError('Invalid file type. Use PNG/JPG/SVG.');
          return;
        }
        if (file.size > MAX_SIZE) {
          setError('File is too large. Max size is 1MB.');
          return;
        }
        setError(null);

        if (onImageUpload) {
          setIsUploading(true);
          onImageUpload(file)
            .then((uploadedUrl) => {
              onChange(uploadedUrl);
            })
            .catch((uploadError) => {
              setError('Failed to upload image. Please try again.');
              console.error('Upload error:', uploadError);
            })
            .finally(() => {
              setIsUploading(false);
            });
        } else {
          // Fallback to object URL for preview (revoke previous to prevent leak)
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
          }
          const url = URL.createObjectURL(file);
          objectUrlRef.current = url;
          onChange(url);
        }
      }
    },
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection?.errors[0]) {
        const errorCode = rejection.errors[0].code;
        if (errorCode === 'file-too-large') {
          setError('File is too large. Max size is 1MB.');
        } else if (errorCode === 'file-invalid-type') {
          setError('Invalid file type. Use PNG/JPG/SVG.');
        }
      }
    },
    accept: { 'image/png': [], 'image/jpeg': [], 'image/jpg': [], 'image/svg+xml': [] },
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: disabled ?? isUploading,
    noClick: false,
    noKeyboard: true, // Prevent spacebar/enter from opening file dialog (conflicts with form submit)
  });

  return (
    <div className='space-y-2'>
      <div
        {...getRootProps({
          className: cn(
            'relative flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-gray-900/50',
            isDragActive && 'border-primary bg-primary/5',
            disabled && 'opacity-50 pointer-events-none',
          ),
          role: 'button',
          'aria-disabled': disabled,
        })}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className='text-gray-600 dark:text-gray-300'>
            <p className='text-sm font-medium'>Uploading...</p>
          </div>
        ) : value ? (
          <div className='flex flex-col items-center gap-2'>
            <div className='relative'>
              <img src={value} alt='Icon preview' className='h-16 w-16 rounded object-cover' />
              {onClear && (
                <Button
                  type='button'
                  variant='destructive'
                  size='icon'
                  className='absolute -top-2 -right-2 h-6 w-6 rounded-full'
                  aria-label='Remove image'
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering dropzone click
                    if (objectUrlRef.current) {
                      URL.revokeObjectURL(objectUrlRef.current);
                      objectUrlRef.current = null;
                    }
                    onClear();
                    setError(null);
                  }}
                >
                  <IconX className='h-4 w-4' />
                </Button>
              )}
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Drop image or click here to change
            </p>
          </div>
        ) : (
          <div className='text-gray-600 dark:text-gray-300'>
            <p className='text-sm font-medium'>Drop image or click here to upload</p>
          </div>
        )}
        {isDragActive && !isUploading && (
          <div className='bg-background/80 text-primary absolute inset-0 flex items-center justify-center rounded-lg text-sm font-medium'>
            Drop to upload
          </div>
        )}
      </div>
      <p className='text-muted-foreground text-left text-xs'>
        Accepted formats: PNG/JPEG, up to 1MB
      </p>
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
};
