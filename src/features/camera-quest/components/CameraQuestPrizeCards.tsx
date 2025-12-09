import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Search, RotateCcw, Gift, Check, ChevronsUpDown, RefreshCw } from 'lucide-react';
import { usePrizeCards, useRemoveCardFromPool, useAvailableCards, useAddCardToPool, useReturnCardToPool, useManuallyGiveCard, useSearchUsers, useRefreshBalances } from '../api';
import { EPrizeCardStatus } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const CameraQuestPrizeCards = () => {
  const [status, setStatus] = useState<EPrizeCardStatus | undefined>();
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableSearch, setAvailableSearch] = useState('');
  const [giveCardDialogOpen, setGiveCardDialogOpen] = useState(false);
  const [selectedCardForGive, setSelectedCardForGive] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: number; label: string } | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const { data, isLoading, refetch } = usePrizeCards({ status, search, limit: 100 });
  const { data: availableData, isLoading: availableLoading } = useAvailableCards({ search: availableSearch, limit: 50 });
  const { data: usersData, isLoading: usersLoading } = useSearchUsers(userSearchQuery);
  const removeCard = useRemoveCardFromPool();
  const addCard = useAddCardToPool();
  const returnCard = useReturnCardToPool();
  const giveCard = useManuallyGiveCard();
  const refreshBalances = useRefreshBalances();

  const userOptions = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users.map((u) => ({
      id: u.id,
      label: u.email || u.username || `User #${u.id}`,
      firstName: u.firstName,
      lastName: u.lastName,
    }));
  }, [usersData]);

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
    setSelectedUser(null);
    setUserSearchQuery('');
    setGiveCardDialogOpen(true);
  };

  const handleGiveCard = async () => {
    if (!selectedUser || !selectedCardForGive) return;

    await giveCard.mutateAsync({
      userId: selectedUser.id,
      prizeCardId: selectedCardForGive,
    });

    setGiveCardDialogOpen(false);
    setSelectedCardForGive(null);
    setSelectedUser(null);
    setUserSearchQuery('');
    void refetch();
  };

  const handleRefreshBalances = async () => {
    if (!data?.cards || data.cards.length === 0) {
      return;
    }

    // Get all adscard card IDs from current cards
    const cardIds = data.cards
      .map((c: any) => c.adscardCardId)
      .filter((id: number) => id != null);

    await refreshBalances.mutateAsync(cardIds);
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefreshBalances}
                disabled={refreshBalances.isPending || !data?.cards || data.cards.length === 0}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshBalances.isPending ? 'animate-spin' : ''}`} />
                Refresh Balances
              </Button>
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
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Card</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {availableData?.cards?.map((card: any) => (
                            <TableRow key={card.id}>
                              <TableCell className="text-muted-foreground text-xs">{card.id}</TableCell>
                              <TableCell className="text-muted-foreground">{card.comment || '—'}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{card.email || '—'}</TableCell>
                              <TableCell className="font-mono">{card.cardMasked || card.cardNumber}</TableCell>
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
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Card Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Distributed To</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.cards?.map((card: any) => (
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
                          <TableCell className="text-sm">
                            {card.distributedToUser ? (
                              <div>
                                <Link
                                  to="/users/$userId"
                                  params={{ userId: card.distributedToUser.id.toString() }}
                                  className="font-medium text-primary hover:underline"
                                >
                                  {card.distributedToUser.email}
                                </Link>
                                {(card.distributedToUser.firstName || card.distributedToUser.lastName) && (
                                  <div className="text-xs text-muted-foreground">
                                    {card.distributedToUser.firstName} {card.distributedToUser.lastName}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
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
                      ))}
                    </TableBody>
                  </Table>
                  {data?.total === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No prize cards found
                    </div>
                  )}
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {data?.cards?.map((card: any) => (
                    <Card key={card.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="font-mono text-sm font-medium">
                              {card.cardNumber || `Card #${card.adscardCardId}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {card.comment || '—'}
                            </div>
                          </div>
                          <Badge variant={card.status === EPrizeCardStatus.Available ? 'default' : card.status === EPrizeCardStatus.Reserved ? 'secondary' : 'outline'}>
                            {card.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground">Balance</div>
                            <div className="font-medium">${card.balance?.toFixed(2) || '0.00'} {card.currency || 'USD'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Added</div>
                            <div className="font-medium">{new Date(card.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          {card.status === EPrizeCardStatus.Available && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1"
                                onClick={() => openGiveCardDialog(card.id)}
                                disabled={giveCard.isPending}
                              >
                                <Gift className="h-4 w-4 mr-1" />
                                Give
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
                              className="w-full"
                              onClick={() => handleReturn(card.id)}
                              disabled={returnCard.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Return to Pool
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {data?.total === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No prize cards found
                    </div>
                  )}
                </div>
              </>
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
              Search and select a user to manually give this card to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between"
                  >
                    {selectedUser ? selectedUser.label : "Search users..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search by email, name, or ID..."
                      value={userSearchQuery}
                      onValueChange={setUserSearchQuery}
                    />
                    <CommandList>
                      {usersLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {!usersLoading && userOptions.length === 0 && userSearchQuery.length >= 2 && (
                        <CommandEmpty>No users found.</CommandEmpty>
                      )}
                      {!usersLoading && userSearchQuery.length < 2 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          Type at least 2 characters to search
                        </div>
                      )}
                      {!usersLoading && userOptions.length > 0 && (
                        <CommandGroup>
                          {userOptions.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.label}
                              onSelect={() => {
                                setSelectedUser(user);
                                setComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{user.label}</div>
                                {user.firstName && (
                                  <div className="text-xs text-muted-foreground">
                                    {user.firstName} {user.lastName || ''}
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                disabled={!selectedUser || giveCard.isPending}
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
