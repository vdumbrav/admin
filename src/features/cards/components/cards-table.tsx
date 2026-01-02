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
import type { Card, TopupFormData } from '../types';
import { createColumns } from './columns';
import { TopupDialog } from './topup-dialog';

const LS_CARDS_TABLE_VIS = 'cards-table-visibility';

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
  { value: 'active', label: 'Active' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'blocked', label: 'Blocked' },
];

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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);

  useEffect(() => {
    saveJSON(LS_CARDS_TABLE_VIS, columnVisibility);
  }, [columnVisibility]);

  // Apply filters to column filters
  useEffect(() => {
    const newFilters: ColumnFiltersState = [];
    if (selectedStatuses.length > 0) {
      newFilters.push({ id: 'status', value: selectedStatuses });
    }
    setColumnFilters(newFilters);
  }, [selectedStatuses]);

  const handleTopup = (card: Card) => {
    setSelectedCard(card);
    setTopupDialogOpen(true);
  };

  const handleFreeze = (card: Card) => {
    console.log('Freeze card:', card.id);
  };

  const handleUnfreeze = (card: Card) => {
    console.log('Unfreeze card:', card.id);
  };

  const handleBlock = (card: Card) => {
    console.log('Block card:', card.id);
  };

  const handleTopupSubmit = async (data: TopupFormData) => {
    console.log('Topup data:', data);
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

  const hasFilters = globalFilter || selectedStatuses.length > 0;

  const handleReset = () => {
    setGlobalFilter('');
    setSelectedStatuses([]);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
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
