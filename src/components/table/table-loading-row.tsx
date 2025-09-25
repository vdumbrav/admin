import { Loader2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';

interface TableLoadingRowProps {
  colSpan: number;
  message?: string;
}

export function TableLoadingRow({
  colSpan,
  message = 'Loading...'
}: TableLoadingRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='h-24'>
        <div className='flex items-center justify-center gap-2'>
          <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
          <span className='text-muted-foreground text-sm'>{message}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}