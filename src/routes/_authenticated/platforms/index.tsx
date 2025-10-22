import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { usePlatforms } from '@/features/markets/platforms/api/platforms';

export const Route = createFileRoute('/_authenticated/platforms/')({
  component: MarketPlatformsPage,
});

function MarketPlatformsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [chainFilter, setChainFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch platforms with filters
  const { data, isLoading } = usePlatforms({
    limit: 100,
    search: debouncedSearch,
    type: typeFilter,
    chain_uid: chainFilter,
  });

  const platforms = data?.platforms || [];
  const total = data?.total || 0;

  // Get unique types and chains for filters
  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(platforms.map(p => p.type))).sort();
  }, [platforms]);

  const uniqueChains = useMemo(() => {
    return Array.from(new Set(platforms.map(p => p.chain_uid))).sort();
  }, [platforms]);

  const isFiltered = searchQuery !== '' || typeFilter !== 'all' || chainFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setChainFilter('all');
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Platforms</h1>
        <p className="text-muted-foreground">
          {isLoading ? 'Loading platforms...' : `Manage blockchain platforms (${platforms.length} of ${total})`}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by type, chain, symbol, address, coin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter} disabled={isLoading}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={chainFilter} onValueChange={setChainFilter} disabled={isLoading}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chains</SelectItem>
                  {uniqueChains.map(chain => (
                    <SelectItem key={chain} value={chain}>{chain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isFiltered && (
                <Button
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="h-9 px-2"
                  disabled={isLoading}
                >
                  Reset
                  <IconX className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Decimals</TableHead>
                    <TableHead>Coin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : platforms.length > 0 ? (
                    platforms.map((platform) => (
                      <TableRow key={platform.id}>
                        <TableCell className="font-medium">{platform.id}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {platform.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{platform.chain_uid}</TableCell>
                        <TableCell className="font-medium">{platform.symbol || '-'}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate" title={platform.address || undefined}>
                          {platform.address || '-'}
                        </TableCell>
                        <TableCell>{platform.decimals}</TableCell>
                        <TableCell>{platform.coin ? platform.coin.name : '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No platforms found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {total > platforms.length && (
              <div className="text-center text-sm text-muted-foreground">
                Showing {platforms.length} of {total} platforms
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
