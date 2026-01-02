import { useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';
import { loadJSON, saveJSON } from '@/utils/persist';
import type { CardOrder } from '../types';
import { createColumns } from './columns';
import { useCancelOrder } from '../api/admin-orders';

const LS_ORDERS_TABLE_VIS = 'orders-table-visibility';

interface OrdersTableServerProps {
  orders: CardOrder[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

// Default hidden columns for cleaner initial view
const defaultHiddenColumns: VisibilityState = {
  cardNumber: false,
  topupSource: false,
  errorMessage: false,
};

export function OrdersTableServer({ orders, page, totalPages, total, onPageChange }: OrdersTableServerProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    loadJSON(LS_ORDERS_TABLE_VIS, defaultHiddenColumns)
  );

  const cancelOrderMutation = useCancelOrder();

  // Persist column visibility
  useEffect(() => {
    saveJSON(LS_ORDERS_TABLE_VIS, columnVisibility);
  }, [columnVisibility]);

  const handleRetry = (order: CardOrder) => {
    console.log('Retry order:', order.id);
  };

  const handleCancel = async (order: CardOrder) => {
    if (!window.confirm(`Are you sure you want to cancel order #${order.id}?`)) {
      return;
    }
    try {
      await cancelOrderMutation.mutateAsync(order.id);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const columns = createColumns({
    onRetry: handleRetry,
    onCancel: handleCancel,
  });

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="space-y-4">
      {/* Toolbar with View options */}
      <div className="flex items-center justify-end">
        <DataTableViewOptions table={table} />
      </div>

      {/* Table */}
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
            {orders.length > 0 ? (
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
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {page} of {totalPages} ({total.toLocaleString()} orders)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
          >
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
          >
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
