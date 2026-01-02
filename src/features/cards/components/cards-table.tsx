import { useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { loadJSON, saveJSON } from '@/utils/persist';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';
import type { Card, TopupFormData } from '../types';
import { createColumns } from './columns';
import { TopupDialog } from './topup-dialog';

const LS_CARDS_TABLE_VIS = 'cards-table-visibility';

interface CardsTableProps {
  cards: Card[];
}

export function CardsTable({ cards }: CardsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    loadJSON(LS_CARDS_TABLE_VIS, {})
  );
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);

  useEffect(() => {
    saveJSON(LS_CARDS_TABLE_VIS, columnVisibility);
  }, [columnVisibility]);

  const handleTopup = (card: Card) => {
    setSelectedCard(card);
    setTopupDialogOpen(true);
  };

  const handleFreeze = (card: Card) => {
    console.log('Freeze card:', card.id);
    // TODO: Implement freeze API call
  };

  const handleUnfreeze = (card: Card) => {
    console.log('Unfreeze card:', card.id);
    // TODO: Implement unfreeze API call
  };

  const handleBlock = (card: Card) => {
    console.log('Block card:', card.id);
    // TODO: Implement block API call
  };

  const handleTopupSubmit = async (data: TopupFormData) => {
    console.log('Topup data:', data);
    // TODO: Implement topup API call
  };

  const columns = createColumns({
    onTopup: handleTopup,
    onFreeze: handleFreeze,
    onUnfreeze: handleUnfreeze,
    onBlock: handleBlock,
  });

  const table = useReactTable({
    data: cards,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const statusFilter = (columnFilters.find((f) => f.id === 'status')
    ?.value as string[]) || ['active', 'frozen', 'blocked'];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search cards by number, cardholder..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="max-w-sm"
            />

            <Select
              value={statusFilter.join(',')}
              onValueChange={(value) => {
                const values = value.split(',');
                table.getColumn('status')?.setFilterValue(values);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active,frozen,blocked">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="frozen">Frozen Only</SelectItem>
                <SelectItem value="blocked">Blocked Only</SelectItem>
                <SelectItem value="active,frozen">Active & Frozen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTableViewOptions table={table} />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No cards found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      <TopupDialog
        card={selectedCard}
        open={topupDialogOpen}
        onOpenChange={setTopupDialogOpen}
        onSubmit={handleTopupSubmit}
      />
    </>
  );
}
