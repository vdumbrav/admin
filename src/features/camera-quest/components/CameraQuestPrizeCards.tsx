import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Search, RotateCcw, Gift } from 'lucide-react';
import { usePrizeCards, useRemoveCardFromPool, useAvailableCards, useAddCardToPool, useReturnCardToPool, useManuallyGiveCard } from '../api';
import { EPrizeCardStatus } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const CameraQuestPrizeCards = () => {
  const [status, setStatus] = useState<EPrizeCardStatus | undefined>();
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableSearch, setAvailableSearch] = useState('');
  const [giveCardDialogOpen, setGiveCardDialogOpen] = useState(false);
  const [selectedCardForGive, setSelectedCardForGive] = useState<number | null>(null);
  const [userId, setUserId] = useState('');

  const { data, isLoading, refetch } = usePrizeCards({ status, search, limit: 100 });
  const { data: availableData, isLoading: availableLoading } = useAvailableCards({ search: availableSearch, limit: 50 });
  const removeCard = useRemoveCardFromPool();
  const addCard = useAddCardToPool();
  const returnCard = useReturnCardToPool();
  const giveCard = useManuallyGiveCard();

  const handleRemove = async (id: number) => {
    if (confirm('Remove this card from prize pool?')) {
      await removeCard.mutateAsync(id);
      void refetch();
    }
  };

  const handleReturn = async (id: number) => {
    if (confirm('Return this card to pool? This will make it available for new sessions.')) {
      await returnCard.mutateAsync(id);
      void refetch();
    }
  };

  const handleAdd = async (cardId: number) => {
    await addCard.mutateAsync({ adscardCardId: cardId });
    setAddDialogOpen(false);
    void refetch();
  };

  const openGiveCardDialog = (cardId: number) => {
    setSelectedCardForGive(cardId);
    setUserId('');
    setGiveCardDialogOpen(true);
  };

  const handleGiveCard = async () => {
    if (!userId || !selectedCardForGive) return;

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return; // Invalid user ID
    }

    await giveCard.mutateAsync({
      userId: userIdNum,
      prizeCardId: selectedCardForGive,
    });

    setGiveCardDialogOpen(false);
    setSelectedCardForGive(null);
    setUserId('');
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
                <Button variant="default">
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
                            <TableHead>Name</TableHead>
                            <TableHead>Card Number</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {availableData?.cards?.map((card: any) => (
                            <TableRow key={card.id}>
                              <TableCell className="text-muted-foreground">{card.comment || '—'}</TableCell>
                              <TableCell className="font-mono">{card.cardNumber}</TableCell>
                              <TableCell>{card.currency}</TableCell>
                              <TableCell>${card.balance?.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="default"
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
                      <TableHead>Name</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.cards?.map((card: any) => {
                      // Debug: log card status
                      console.log('Card:', card.cardNumber, 'Status:', card.status, 'Type:', typeof card.status);
                      return (
                      <TableRow key={card.id}>
                        <TableCell className="font-mono">{card.cardNumber || `Card #${card.adscardCardId}`}</TableCell>
                        <TableCell className="text-muted-foreground">{card.comment || '—'}</TableCell>
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
                          <div className="flex gap-2">
                            {card.status === EPrizeCardStatus.Available && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => openGiveCardDialog(card.id)}
                                  disabled={giveCard.isPending}
                                >
                                  <Gift className="h-4 w-4 mr-1" />
                                  Give to User
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRemove(card.id)}
                                  disabled={removeCard.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {(card.status === EPrizeCardStatus.Distributed || card.status === EPrizeCardStatus.Reserved) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReturn(card.id)}
                                disabled={returnCard.isPending}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Return to Pool
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })}
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

      {/* Give Card to User Dialog */}
      <Dialog open={giveCardDialogOpen} onOpenChange={setGiveCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Give Card to User</DialogTitle>
            <DialogDescription>
              Enter the User ID to manually give this card to a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="number"
                placeholder="Enter user ID (e.g., 13)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void handleGiveCard();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setGiveCardDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleGiveCard()}
                disabled={!userId || giveCard.isPending}
              >
                {giveCard.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Give Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
