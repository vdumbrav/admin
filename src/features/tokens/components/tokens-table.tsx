import { useState } from 'react';
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
import type { TokenListItem, UpdateTokenRequest } from '../types';
import { getNetworkLabel, isCustodySupported } from '../data/data';

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

  const handleToggle = async (
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
  };

  const allSelected = tokens.length > 0 && tokens.every((t) => selectedIds.includes(t.id));
  const someSelected = tokens.some((t) => selectedIds.includes(t.id)) && !allSelected;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  // @ts-expect-error indeterminate is valid
                  indeterminate={someSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Network</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1">
                    <IconWorld className="h-4 w-4" />
                    Web
                  </TooltipTrigger>
                  <TooltipContent>Visible on Web</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1">
                    <IconDeviceMobile className="h-4 w-4" />
                    Mobile
                  </TooltipTrigger>
                  <TooltipContent>Visible on Mobile</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1">
                    <IconBrandTelegram className="h-4 w-4" />
                    TG
                  </TooltipTrigger>
                  <TooltipContent>Visible on Telegram</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1">
                    <IconArrowDown className="h-4 w-4" />
                    Dep
                  </TooltipTrigger>
                  <TooltipContent>Deposit Enabled</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1">
                    <IconArrowUp className="h-4 w-4" />
                    With
                  </TooltipTrigger>
                  <TooltipContent>Withdraw Enabled</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-1">
                    <IconArrowsExchange className="h-4 w-4" />
                    Exch
                  </TooltipTrigger>
                  <TooltipContent>Exchange Enabled</TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No tokens found.
                </TableCell>
              </TableRow>
            ) : (
              tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(token.id)}
                      onCheckedChange={(checked) => onSelectToken(token.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isCustodySupported(token.network) ? 'default' : 'outline'}
                      className={isCustodySupported(token.network) ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {getNetworkLabel(token.network)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={token.isActive}
                      disabled={isUpdating || updatingField === `${token.id}-isActive`}
                      onCheckedChange={(checked) => handleToggle(token, 'isActive', checked)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={token.visibleOnWeb}
                      disabled={isUpdating || updatingField === `${token.id}-visibleOnWeb`}
                      onCheckedChange={(checked) => handleToggle(token, 'visibleOnWeb', checked)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={token.visibleOnMobile}
                      disabled={isUpdating || updatingField === `${token.id}-visibleOnMobile`}
                      onCheckedChange={(checked) => handleToggle(token, 'visibleOnMobile', checked)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={token.visibleOnTelegram}
                      disabled={isUpdating || updatingField === `${token.id}-visibleOnTelegram`}
                      onCheckedChange={(checked) =>
                        handleToggle(token, 'visibleOnTelegram', checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={token.depositEnabled}
                      disabled={isUpdating || updatingField === `${token.id}-depositEnabled`}
                      onCheckedChange={(checked) => handleToggle(token, 'depositEnabled', checked)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={token.withdrawEnabled}
                      disabled={isUpdating || updatingField === `${token.id}-withdrawEnabled`}
                      onCheckedChange={(checked) => handleToggle(token, 'withdrawEnabled', checked)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={token.exchangeEnabled}
                      disabled={isUpdating || updatingField === `${token.id}-exchangeEnabled`}
                      onCheckedChange={(checked) => handleToggle(token, 'exchangeEnabled', checked)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
