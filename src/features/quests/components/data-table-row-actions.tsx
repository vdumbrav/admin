import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Link } from '@tanstack/react-router';
import { type Row } from '@tanstack/react-table';
import { IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuestsContext } from '../context/quests-context';
import type { Quest } from '../data/types';
import { useQuestSearch } from '../use-quest-search';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export const DataTableRowActions = <TData,>({ row }: DataTableRowActionsProps<TData>) => {
  // Be permissive here: backend data can be partial/inconsistent during migration.
  // We only need id for link and the raw row for dialogs.
  const quest = row.original as unknown as { id?: number | string } & Record<string, unknown>;
  const { setOpen, setCurrentRow } = useQuestsContext();
  const search = useQuestSearch({ from: '/_authenticated/quests/' as const });
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='data-[state=open]:bg-muted flex h-8 w-8 p-0'>
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem asChild>
          <Link to='/quests/$id' params={{ id: String(quest.id) }} search={search}>
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(quest as unknown as Quest);
            setOpen('delete');
          }}
        >
          Delete
          <DropdownMenuShortcut>
            <IconTrash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
