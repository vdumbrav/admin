import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconChevronDown,
  IconWorld,
  IconDeviceMobile,
  IconBrandTelegram,
  IconArrowDown,
  IconArrowUp,
  IconArrowsExchange,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

interface TokenBulkActionsProps {
  selectedCount: number;
  onBulkPlatformUpdate: (platform: 'web' | 'mobile' | 'telegram', visible: boolean) => void;
  onBulkFeatureUpdate: (feature: 'deposit' | 'withdraw' | 'exchange', enabled: boolean) => void;
  disabled?: boolean;
}

export function TokenBulkActions({
  selectedCount,
  onBulkPlatformUpdate,
  onBulkFeatureUpdate,
  disabled,
}: TokenBulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          Bulk Actions ({selectedCount})
          <IconChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Platform Visibility</DropdownMenuLabel>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconWorld className="mr-2 h-4 w-4" />
            Web
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onBulkPlatformUpdate('web', true)}>
              <IconCheck className="mr-2 h-4 w-4 text-green-500" />
              Show on Web
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkPlatformUpdate('web', false)}>
              <IconX className="mr-2 h-4 w-4 text-red-500" />
              Hide on Web
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconDeviceMobile className="mr-2 h-4 w-4" />
            Mobile
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onBulkPlatformUpdate('mobile', true)}>
              <IconCheck className="mr-2 h-4 w-4 text-green-500" />
              Show on Mobile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkPlatformUpdate('mobile', false)}>
              <IconX className="mr-2 h-4 w-4 text-red-500" />
              Hide on Mobile
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconBrandTelegram className="mr-2 h-4 w-4" />
            Telegram
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onBulkPlatformUpdate('telegram', true)}>
              <IconCheck className="mr-2 h-4 w-4 text-green-500" />
              Show on Telegram
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkPlatformUpdate('telegram', false)}>
              <IconX className="mr-2 h-4 w-4 text-red-500" />
              Hide on Telegram
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Features</DropdownMenuLabel>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconArrowDown className="mr-2 h-4 w-4" />
            Deposit
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onBulkFeatureUpdate('deposit', true)}>
              <IconCheck className="mr-2 h-4 w-4 text-green-500" />
              Enable Deposit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkFeatureUpdate('deposit', false)}>
              <IconX className="mr-2 h-4 w-4 text-red-500" />
              Disable Deposit
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconArrowUp className="mr-2 h-4 w-4" />
            Withdraw
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onBulkFeatureUpdate('withdraw', true)}>
              <IconCheck className="mr-2 h-4 w-4 text-green-500" />
              Enable Withdraw
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkFeatureUpdate('withdraw', false)}>
              <IconX className="mr-2 h-4 w-4 text-red-500" />
              Disable Withdraw
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconArrowsExchange className="mr-2 h-4 w-4" />
            Exchange
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onBulkFeatureUpdate('exchange', true)}>
              <IconCheck className="mr-2 h-4 w-4 text-green-500" />
              Enable Exchange
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkFeatureUpdate('exchange', false)}>
              <IconX className="mr-2 h-4 w-4 text-red-500" />
              Disable Exchange
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
