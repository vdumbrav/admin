import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
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
import type { CardOrder } from '../types';
import { createColumns } from './columns';
import { useCancelOrder } from '../api/admin-orders';

interface OrdersTableProps {
  orders: CardOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const cancelOrderMutation = useCancelOrder();

  const handleRetry = (order: CardOrder) => {
    console.log('Retry order:', order.id);
    // TODO: Implement retry API call
  };

  const handleCancel = async (order: CardOrder) => {
    if (!window.confirm(`Are you sure you want to cancel order #${order.id}?`)) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync(order.id);
    } catch (error) {
      // Error already handled by mutation's onError
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
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
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
    ?.value as string[]) || [
    'draft',
    'pending',
    'confirmed',
    'processing',
    'completed',
    'failed',
    'cancelled',
  ];

  const orderTypeFilter = (columnFilters.find((f) => f.id === 'orderType')
    ?.value as string[]) || ['card_creation', 'card_topup'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search orders by ID, user ID, card..."
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
            <SelectItem value="draft,pending,confirmed,processing,completed,failed,cancelled">
              All Statuses
            </SelectItem>
            <SelectItem value="draft">Draft Only</SelectItem>
            <SelectItem value="pending">Pending Only</SelectItem>
            <SelectItem value="confirmed">Confirmed Only</SelectItem>
            <SelectItem value="processing">Processing Only</SelectItem>
            <SelectItem value="completed">Completed Only</SelectItem>
            <SelectItem value="failed">Failed Only</SelectItem>
            <SelectItem value="cancelled">Cancelled Only</SelectItem>
            <SelectItem value="draft,pending,confirmed,processing">Active Orders</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={orderTypeFilter.join(',')}
          onValueChange={(value) => {
            const values = value.split(',');
            table.getColumn('orderType')?.setFilterValue(values);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card_creation,card_topup">All Types</SelectItem>
            <SelectItem value="card_creation">Card Creation</SelectItem>
            <SelectItem value="card_topup">Card Topup</SelectItem>
          </SelectContent>
        </Select>
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
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
