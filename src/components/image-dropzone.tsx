import { Spinner } from '@radix-ui/themes';
import { mediaErrors } from '@/errors/media';
import { type FileError, useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const dropErrors: Record<FileError['code'], string> = {
  'file-too-large': mediaErrors.size,
  'file-invalid-type': mediaErrors.type,
};

interface ImageDropzoneProps {
  preview?: string;
  onFile: (file: File) => void | Promise<void>;
  onClear: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ImageDropzone = ({
  preview,
  onFile,
  onClear,
  disabled,
  loading,
}: ImageDropzoneProps) => {
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (accepted) => {
      const file = accepted[0];
      void onFile(file);
    },
    onDropRejected: (rejections) => {
      rejections[0]?.errors.forEach((e) => {
        const msg = dropErrors[e.code];
        if (msg) toast.error(msg);
      });
    },
    accept: { 'image/png': [], 'image/jpeg': [] },
    maxSize: 1024 * 1024,
    multiple: false,
    disabled: disabled ?? loading,
    noClick: false,
    noKeyboard: true,
  });

  return (
    <div className='space-y-2'>
      <div
        {...getRootProps({
          className: cn(
            'relative flex flex-col items-center justify-center rounded border-2 border-dashed p-4 text-center transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            isDragActive && 'border-primary bg-primary/5',
            (disabled ?? loading) && 'opacity-50 pointer-events-none',
          ),
          role: 'button',
          'aria-disabled': disabled ?? loading,
          'aria-describedby': 'icon-hint',
        })}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt='Icon preview' className='h-16 w-16 rounded object-contain' />
        ) : (
          <div className='text-muted-foreground flex h-16 w-16 items-center justify-center rounded border text-xs'>
            No image
          </div>
        )}
        {isDragActive && (
          <span className='bg-background/80 absolute inset-0 flex items-center justify-center rounded text-sm'>
            Drop to upload
          </span>
        )}
        {loading && (
          <span className='bg-background/80 absolute inset-0 flex items-center justify-center rounded'>
            <Spinner />
          </span>
        )}
      </div>
      <div className='flex gap-2'>
        <Button type='button' variant='outline' onClick={open} disabled={disabled ?? loading}>
          Choose File
        </Button>
        {preview && (
          <Button type='button' variant='ghost' onClick={onClear} disabled={disabled ?? loading}>
            Clear
          </Button>
        )}
      </div>
      <p id='icon-hint' className='text-muted-foreground text-xs'>
        Accepted formats: PNG/JPEG, up to 1MB
      </p>
    </div>
  );
};
