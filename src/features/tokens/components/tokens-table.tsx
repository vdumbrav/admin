import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IconWorld,
  IconDeviceMobile,
  IconBrandTelegram,
  IconArrowDown,
  IconArrowUp,
  IconArrowsExchange,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { loadJSON, saveJSON } from '@/utils/persist';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';
import type { TokenListItem, UpdateTokenRequest } from '../types';
import { getNetworkLabel, isCustodySupported } from '../data/data';

const LS_TOKEN_TABLE_VIS = 'token-table-visibility';

interface TokensTableProps {
  tokens: TokenListItem[];
  page: number;
  totalPages: number;
  total: number;
  selectedIds: number[];
  onPageChange: (page: number) => void;
  onSelectToken: (id: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUpdateToken: (id: number, data: UpdateTokenRequest) => void;
  isUpdating: boolean;
}

export function TokensTable({
  tokens,
  page,
  totalPages,
  total,
  selectedIds,
  onPageChange,
  onSelectToken,
  onSelectAll,
  onUpdateToken,
  isUpdating,
}: TokensTableProps) {
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    loadJSON(LS_TOKEN_TABLE_VIS, {})
  );

  useEffect(() => {
    saveJSON(LS_TOKEN_TABLE_VIS, columnVisibility);
  }, [columnVisibility]);

  const handleToggle = useCallback(
    async (
      token: TokenListItem,
      field: keyof UpdateTokenRequest,
      value: boolean
    ) => {
      setUpdatingField(`${token.id}-${field}`);
      try {
        await onUpdateToken(token.id, { [field]: value });
        toast.success(`${token.symbol} ${field} updated`);
      } catch (error) {
        toast.error(`Failed to update ${token.symbol}`);
      } finally {
        setUpdatingField(null);
      }
    },
    [onUpdateToken]
  );

  const allSelected = tokens.length > 0 && tokens.every((t) => selectedIds.includes(t.id));
  const someSelected = tokens.some((t) => selectedIds.includes(t.id)) && !allSelected;

  const columns: ColumnDef<TokenListItem>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={allSelected}
            // @ts-expect-error indeterminate is valid
            indeterminate={someSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onCheckedChange={(checked) => onSelectToken(row.original.id, !!checked)}
          />
        ),
        enableHiding: false,
      },
      {
        id: 'token',
        accessorKey: 'symbol',
        header: 'Token',
        cell: ({ row }) => {
          const token = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={token.logoUrl || token.fallbackLogoUrl}
                  alt={token.symbol}
                />
                <AvatarFallback className="text-xs">
                  {token.symbol.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{token.symbol.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {token.name}
                </span>
              </div>
            </div>
          );
        },
        enableHiding: false,
      },
      {
        id: 'network',
        accessorKey: 'network',
        header: 'Network',
        cell: ({ row }) => {
          const network = row.original.network;
          return (
            <Badge
              variant={isCustodySupported(network) ? 'default' : 'outline'}
              className={isCustodySupported(network) ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {getNetworkLabel(network)}
            </Badge>
          );
        },
      },
      {
        id: 'isActive',
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
          const token = row.original;
          return (
            <Switch
              checked={token.isActive}
              disabled={isUpdating || updatingField === `${token.id}-isActive`}
              onCheckedChange={(checked) => handleToggle(token, 'isActive', checked)}
            />
          );
        },
      },
      {
        id: 'visibleOnWeb',
        accessorKey: 'visibleOnWeb',
        header: () => (
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <IconWorld className="h-4 w-4" />
              Web
            </TooltipTrigger>
            <TooltipContent>Visible on Web</TooltipContent>
          </Tooltip>
        ),
        cell: ({ row }) => {
          const token = row.original;
          return (
            <Switch
              checked={token.visibleOnWeb}
              disabled={isUpdating || updatingField === `${token.id}-visibleOnWeb`}
              onCheckedChange={(checked) => handleToggle(token, 'visibleOnWeb', checked)}
            />
          );
        },
      },
      {
        id: 'visibleOnMobile',
        accessorKey: 'visibleOnMobile',
        header: () => (
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <IconDeviceMobile className="h-4 w-4" />
              Mobile
            </TooltipTrigger>
            <TooltipContent>Visible on Mobile</TooltipContent>
          </Tooltip>
        ),
        cell: ({ row }) => {
          const token = row.original;
          return (
            <Switch
              checked={token.visibleOnMobile}
              disabled={isUpdating || updatingField === `${token.id}-visibleOnMobile`}
              onCheckedChange={(checked) => handleToggle(token, 'visibleOnMobile', checked)}
            />
          );
        },
      },
      {
        id: 'visibleOnTelegram',
        accessorKey: 'visibleOnTelegram',
        header: () => (
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <IconBrandTelegram className="h-4 w-4" />
              TG
            </TooltipTrigger>
            <TooltipContent>Visible on Telegram</TooltipContent>
          </Tooltip>
        ),
        cell: ({ row }) => {
          const token = row.original;
          return (
            <Switch
              checked={token.visibleOnTelegram}
              disabled={isUpdating || updatingField === `${token.id}-visibleOnTelegram`}
              onCheckedChange={(checked) => handleToggle(token, 'visibleOnTelegram', checked)}
            />
          );
        },
      },
      {
        id: 'depositEnabled',
        accessorKey: 'depositEnabled',
        header: () => (
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <IconArrowDown className="h-4 w-4" />
              Dep
            </TooltipTrigger>
            <TooltipContent>Deposit Enabled</TooltipContent>
          </Tooltip>
        ),
        cell: ({ row }) => {
          const token = row.original;
          return (
            <Switch
              checked={token.depositEnabled}
              disabled={isUpdating || updatingField === `${token.id}-depositEnabled`}
              onCheckedChange={(checked) => handleToggle(token, 'depositEnabled', checked)}
            />
          );
        },
      },
      {
        id: 'withdrawEnabled',
        accessorKey: 'withdrawEnabled',
        header: () => (
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <IconArrowUp className="h-4 w-4" />
              With
            </TooltipTrigger>
            <TooltipContent>Withdraw Enabled</TooltipContent>
          </Tooltip>
        ),
        cell: ({ row }) => {
          const token = row.original;
          return (
            <Switch
              checked={token.withdrawEnabled}
              disabled={isUpdating || updatingField === `${token.id}-withdrawEnabled`}
              onCheckedChange={(checked) => handleToggle(token, 'withdrawEnabled', checked)}
            />
          );
        },
      },
      {
        id: 'exchangeEnabled',
        accessorKey: 'exchangeEnabled',
        header: () => (
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <IconArrowsExchange className="h-4 w-4" />
              Exch
            </TooltipTrigger>
            <TooltipContent>Exchange Enabled</TooltipContent>
          </Tooltip>
        ),
        cell: ({ row }) => {
          const token = row.original;
          return (
            <Switch
              checked={token.exchangeEnabled}
              disabled={isUpdating || updatingField === `${token.id}-exchangeEnabled`}
              onCheckedChange={(checked) => handleToggle(token, 'exchangeEnabled', checked)}
            />
          );
        },
      },
    ],
    [allSelected, someSelected, selectedIds, isUpdating, updatingField, onSelectAll, onSelectToken, handleToggle]
  );

  const table = useReactTable({
    data: tokens,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* View Options */}
        <div className="flex justify-end">
          <DataTableViewOptions table={table} />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-3 py-2 text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No tokens found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn('h-11', {
                      'bg-background': row.index % 2 === 0,
                      'bg-muted/20': row.index % 2 !== 0,
                    })}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2 text-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {selectedIds.length > 0 && (
              <span className="mr-4 font-medium">{selectedIds.length} selected</span>
            )}
            Showing {tokens.length} of {total.toLocaleString()} tokens
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
