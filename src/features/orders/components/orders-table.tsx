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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';
import { IconSearch } from '@tabler/icons-react';
import { CheckIcon, PlusCircledIcon, Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import type { CardOrder } from '../types';
import { createColumns } from './columns';
import { useCancelOrder } from '../api/admin-orders';

const LS_ORDERS_TABLE_VIS = 'orders-table-visibility';

// Faceted Filter Component
interface FacetedFilterProps {
  title: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelect: (values: string[]) => void;
  multiple?: boolean;
}

function FacetedFilter({
  title,
  options,
  selectedValues,
  onSelect,
  multiple = true,
}: FacetedFilterProps) {
  const selected = new Set(selectedValues);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selected.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selected.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selected.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selected.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (multiple) {
                        const newSet = new Set(selected);
                        if (isSelected) newSet.delete(option.value);
                        else newSet.add(option.value);
                        onSelect(Array.from(newSet));
                      } else {
                        onSelect(isSelected ? [] : [option.value]);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onSelect([])} className="justify-center text-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const typeOptions = [
  { value: 'card_creation', label: 'Card Creation' },
  { value: 'card_topup', label: 'Card Topup' },
];

interface OrdersTableProps {
  orders: CardOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    loadJSON(LS_ORDERS_TABLE_VIS, {})
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    saveJSON(LS_ORDERS_TABLE_VIS, columnVisibility);
  }, [columnVisibility]);

  // Apply filters to column filters
  useEffect(() => {
    const newFilters: ColumnFiltersState = [];
    if (selectedStatuses.length > 0) {
      newFilters.push({ id: 'status', value: selectedStatuses });
    }
    if (selectedTypes.length > 0) {
      newFilters.push({ id: 'orderType', value: selectedTypes });
    }
    setColumnFilters(newFilters);
  }, [selectedStatuses, selectedTypes]);

  const cancelOrderMutation = useCancelOrder();

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

  const hasFilters = globalFilter || selectedStatuses.length > 0 || selectedTypes.length > 0;

  const handleReset = () => {
    setGlobalFilter('');
    setSelectedStatuses([]);
    setSelectedTypes([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="h-8 w-[300px] pl-8"
            />
          </div>

          <FacetedFilter
            title="Status"
            options={statusOptions}
            selectedValues={selectedStatuses}
            onSelect={setSelectedStatuses}
          />

          <FacetedFilter
            title="Type"
            options={typeOptions}
            selectedValues={selectedTypes}
            onSelect={setSelectedTypes}
          />

          {hasFilters && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-8 px-2 text-sm leading-5 font-medium lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
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
