import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Search } from 'lucide-react';
import { usePrizeCards, useRemoveCardFromPool, useAvailableCards, useAddCardToPool } from '../api';
import { EPrizeCardStatus } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const CameraQuestPrizeCards = () => {
  const [status, setStatus] = useState<EPrizeCardStatus | undefined>();
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableSearch, setAvailableSearch] = useState('');

  const { data, isLoading, refetch } = usePrizeCards({ status, search, limit: 100 });
  const { data: availableData, isLoading: availableLoading } = useAvailableCards({ search: availableSearch, limit: 50 });
  const removeCard = useRemoveCardFromPool();
  const addCard = useAddCardToPool();

  const handleRemove = async (id: number) => {
    if (confirm('Remove this card from prize pool?')) {
      await removeCard.mutateAsync(id);
      void refetch();
    }
  };

  const handleAdd = async (cardId: number) => {
    await addCard.mutateAsync({ adscardCardId: cardId });
    setAddDialogOpen(false);
    void refetch();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prize Cards Pool</CardTitle>
              <CardDescription>Manage cards available as prizes for Camera Quest</CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Cards
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Cards to Prize Pool</DialogTitle>
                  <DialogDescription>
                    Select cards to add to the Camera Quest prize pool
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by card number..."
                      value={availableSearch}
                      onChange={(e) => setAvailableSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {availableLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Card Number</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {availableData?.cards?.map((card: any) => (
                            <TableRow key={card.id}>
                              <TableCell className="font-mono">{card.cardNumber}</TableCell>
                              <TableCell>{card.currency}</TableCell>
                              <TableCell>${card.balance?.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => handleAdd(card.id)}
                                  disabled={addCard.isPending}
                                >
                                  Add
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search cards..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? undefined : v as EPrizeCardStatus)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={EPrizeCardStatus.Available}>Available</SelectItem>
                  <SelectItem value={EPrizeCardStatus.Reserved}>Reserved</SelectItem>
                  <SelectItem value={EPrizeCardStatus.Distributed}>Distributed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card Number</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.cards?.map((card: any) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-mono">{card.cardNumber || `Card #${card.adscardCardId}`}</TableCell>
                        <TableCell>{card.currency || 'USD'}</TableCell>
                        <TableCell>${card.balance?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          <Badge variant={card.status === EPrizeCardStatus.Available ? 'default' : card.status === EPrizeCardStatus.Reserved ? 'secondary' : 'outline'}>
                            {card.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(card.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {card.status === EPrizeCardStatus.Available && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemove(card.id)}
                              disabled={removeCard.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {data?.total === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No prize cards found
                  </div>
                )}
              </div>
            )}

            {data && data.total > 0 && (
              <div className="text-sm text-muted-foreground">
                Total: {data.total} cards
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
