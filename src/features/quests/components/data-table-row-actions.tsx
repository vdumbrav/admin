import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Link } from '@tanstack/react-router';
import { type Row } from '@tanstack/react-table';
import { IconStar, IconStarOff, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTogglePinned } from '../api';
import { useQuestsContext } from '../context/quests-context';
import type { Quest } from '../data/types';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export const DataTableRowActions = <TData,>({ row }: DataTableRowActionsProps<TData>) => {
  // Be permissive here: backend data can be partial/inconsistent during migration.
  // We only need id for link and the raw row for dialogs.
  const quest = row.original as Quest;
  const { setOpen, setCurrentRow } = useQuestsContext();
  const togglePinned = useTogglePinned();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          aria-label={`Row actions for ${String(quest.title || 'quest')}`}
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {typeof quest.pinned !== 'undefined' && (
          <DropdownMenuItem
            onClick={() => togglePinned.mutate({ id: Number(quest.id), pinned: !quest.pinned })}
            aria-label={`${quest.pinned ? 'Unpin' : 'Pin'} ${String(quest.title || 'quest')}`}
          >
            {quest.pinned ? 'Unpin' : 'Pin'}
            <DropdownMenuShortcut>
              {quest.pinned ? <IconStarOff size={16} /> : <IconStar size={16} />}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            to='/quests/$id'
            params={{ id: String(quest.id) }}
            search={{
              search: '',
              group: '',
              type: '',
              provider: '',
              enabled: '',
              page: 1,
              limit: 20,
              sort: '',
              showForm: false,
            }}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(quest);
            setOpen('delete');
          }}
          aria-label={`Delete ${String(quest.title || 'quest')}`}
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
