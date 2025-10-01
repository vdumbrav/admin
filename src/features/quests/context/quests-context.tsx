import React, { useState } from 'react';
import type { TaskResponseDto } from '@/lib/api/generated/model';
import useDialogState from '@/hooks/use-dialog-state';

type QuestsDialogType = 'delete';

interface QuestsContextType {
  open: QuestsDialogType | null;
  setOpen: (o: QuestsDialogType | null) => void;
  currentRow: TaskResponseDto | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<TaskResponseDto | null>>;
}

const QuestsContext = React.createContext<QuestsContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export const QuestsProvider = ({ children }: Props) => {
  const [open, setOpen] = useDialogState<QuestsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<TaskResponseDto | null>(null);
  return (
    <QuestsContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</QuestsContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useQuestsContext = () => {
  const ctx = React.useContext(QuestsContext);
  if (!ctx) {
    throw new Error('useQuestsContext must be used within QuestsProvider');
  }
  return ctx;
};
