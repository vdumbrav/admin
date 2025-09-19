import { ConfirmDialog } from '@/components/confirm-dialog';
import { useDeleteQuest } from '../api';
import { useQuestsContext } from '../context/quests-context';

export const QuestsDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useQuestsContext();
  const del = useDeleteQuest();
  return (
    <>
      {currentRow && (
        <ConfirmDialog
          key='quest-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete');
            setTimeout(() => setCurrentRow(null), 500);
          }}
          handleConfirm={async () => {
            await del.mutateAsync(currentRow.id);
            setOpen(null);
            setTimeout(() => setCurrentRow(null), 500);
          }}
          isLoading={del.isPending}
          title={`Delete quest: ${currentRow.id}?`}
          desc='This action cannot be undone.'
          confirmText='Delete'
          className='max-w-md'
        />
      )}
    </>
  );
};
