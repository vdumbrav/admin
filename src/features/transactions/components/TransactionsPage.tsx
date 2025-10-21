import { useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconRefresh, IconDownload } from '@tabler/icons-react';
import { TransactionsTable } from './TransactionsTable';
import { TransactionsFilters } from './TransactionsFilters';
import { useTransactions } from '../hooks/useTransactions';
import type { TransactionFilters } from '../types';

export function TransactionsPage() {
  const search = useSearch({ from: '/_authenticated/transactions/' }) as { cardId?: number; userId?: number };
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    itemsPerPage: 50,
  });

  // Apply filters from URL search params
  useEffect(() => {
    const updates: Partial<TransactionFilters> = {};
    if (search.cardId) updates.cardId = search.cardId;
    if (search.userId) updates.userId = search.userId;

    if (Object.keys(updates).length > 0) {
      setFilters((f) => ({ ...f, ...updates }));
    }
  }, [search.cardId, search.userId]);

  const { data, isLoading, refetch } = useTransactions(filters);

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export transactions', data);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Transactions
            {filters.cardId && (
              <span className="ml-3 text-lg font-normal text-muted-foreground">
                for Card #{filters.cardId}
              </span>
            )}
            {filters.userId && (
              <span className="ml-3 text-lg font-normal text-muted-foreground">
                for User #{filters.userId}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            View all platform transactions and payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExport} disabled={!data?.items?.length}>
            <IconDownload className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Total Transactions
            </div>
            <div className="text-2xl font-bold">
              {data?.totalItems || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Completed
            </div>
            <div className="text-2xl font-bold text-green-600">
              {data?.items?.filter((tx) => String(tx.status) === 'completed').length ||
                0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Pending
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.items?.filter((tx) => String(tx.status) === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Failed
            </div>
            <div className="text-2xl font-bold text-red-600">
              {data?.items?.filter((tx) => String(tx.status) === 'failed').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TransactionsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Transactions Table */}
      <TransactionsTable
        transactions={data?.items}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {data && data.totalItems && data.totalItems > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {data.items?.length || 0} of {data.totalItems} transactions
            {data.page && data.totalPages && ` (Page ${data.page} of ${data.totalPages})`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.page || data.page <= 1}
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.page || !data.totalPages || data.page >= data.totalPages}
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
