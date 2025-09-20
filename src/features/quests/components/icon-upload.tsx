import { useState } from 'react';
import { FormDescription, FormMessage } from '@/components/ui/form';
import { ImageDropzone } from '@/components/image-dropzone';

interface IconUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const MAX_SIZE = 1024 * 1024; // 1MB

export const IconUpload = ({ value, onChange, onClear, disabled }: IconUploadProps) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        <div className='h-10 w-10 overflow-hidden rounded border bg-white'>
          {value ? (
            <img src={value} alt='Icon preview' className='h-10 w-10 object-cover' />
          ) : (
            <div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs'>
              40×40
            </div>
          )}
        </div>
        <div className='flex-1'>
          <ImageDropzone
            preview={value}
            onFile={async (file) => {
              // Validate type and size
              if (!ALLOWED_TYPES.includes(file.type)) {
                setError('Invalid file type. Use PNG/JPG/SVG.');
                return;
              }
              if (file.size > MAX_SIZE) {
                setError('File is too large. Max size is 1MB.');
                return;
              }
              setError(null);
              // Delegate actual upload to parent via form layer
              // Parent will call onChange with resulting URL
            }}
            onClear={() => {
              setError(null);
              onClear?.();
              onChange('');
            }}
            disabled={disabled}
          />
        </div>
      </div>
      <FormDescription>Upload square image ≤ 1MB (PNG/JPG/SVG).</FormDescription>
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
};
