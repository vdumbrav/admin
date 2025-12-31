import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconCrown, IconEdit, IconTrash, IconPlus, IconSparkles, IconX, IconRefresh } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAppAuth } from '@/auth/hooks';

interface PremiumBundle {
  id: number;
  service: string;
  title: string;
  price: number;
  price_twa: number;
  level: number;
  boost: number;
  referrals: number;
  referrals_earn: number;
  resource: {
    uid?: string;
    support?: boolean;
    bestChoose?: boolean;
    discordRole?: string;
    earlyAccess?: boolean;
    privateGroup?: boolean;
    rankingBoard?: boolean;
    gateway?: {
      name?: string;
      description?: string;
    };
  };
  created_at: string;
}

interface BundleFormData {
  title: string;
  price: number;
  price_twa: number;
  level: number;
  boost: number;
  referrals: number;
  referrals_earn: number;
  resource: {
    support: boolean;
    earlyAccess: boolean;
    privateGroup: boolean;
    rankingBoard: boolean;
    discordRole: string;
  };
}

const defaultFormData: BundleFormData = {
  title: '',
  price: 0,
  price_twa: 0,
  level: 0,
  boost: 1,
  referrals: 0,
  referrals_earn: 0,
  resource: {
    support: false,
    earlyAccess: false,
    privateGroup: false,
    rankingBoard: false,
    discordRole: '',
  },
};

export function PremiumPage() {
  const [bundles, setBundles] = useState<PremiumBundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBundle, setEditingBundle] = useState<PremiumBundle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<PremiumBundle | null>(null);
  const [formData, setFormData] = useState<BundleFormData>(defaultFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState<{ description: string; shortDescription: string } | null>(null);
  const [descriptionLanguage, setDescriptionLanguage] = useState('ru');
  const auth = useAppAuth();

  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.moliedev.xyz';

  const fetchBundles = async () => {
    setIsLoading(true);
    try {
      const token = await auth.getAccessToken();
      const response = await fetch(`${apiUrl}/admin/bundles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBundles(data.bundles || []);
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
      toast.error('Failed to load bundles');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bundles on mount
  useEffect(() => {
    fetchBundles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveBundle = async () => {
    try {
      const token = await auth.getAccessToken();
      const url = editingBundle
        ? `${apiUrl}/admin/bundles/${editingBundle.id}`
        : `${apiUrl}/admin/bundles`;
      const method = editingBundle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingBundle ? 'Bundle updated' : 'Bundle created');
        setIsDialogOpen(false);
        setEditingBundle(null);
        setFormData(defaultFormData);
        fetchBundles();
      } else {
        toast.error('Failed to save bundle');
      }
    } catch (error) {
      console.error('Failed to save bundle:', error);
      toast.error('Failed to save bundle');
    }
  };

  const handleDeleteBundle = async () => {
    if (!bundleToDelete) return;
    try {
      const token = await auth.getAccessToken();
      const response = await fetch(`${apiUrl}/admin/bundles/${bundleToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Bundle deleted');
        setIsDeleteDialogOpen(false);
        setBundleToDelete(null);
        fetchBundles();
      } else {
        toast.error('Failed to delete bundle');
      }
    } catch (error) {
      console.error('Failed to delete bundle:', error);
      toast.error('Failed to delete bundle');
    }
  };

  const handleSetBestChoice = async (bundle: PremiumBundle, isBest: boolean) => {
    try {
      const token = await auth.getAccessToken();
      const response = await fetch(`${apiUrl}/admin/bundles/${bundle.id}/best-choice`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBest }),
      });

      if (response.ok) {
        toast.success(isBest ? 'Set as best choice' : 'Removed best choice');
        fetchBundles();
      }
    } catch (error) {
      console.error('Failed to update best choice:', error);
      toast.error('Failed to update');
    }
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
      const token = await auth.getAccessToken();
      const response = await fetch(`${apiUrl}/admin/bundles/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          features: {
            boost: formData.boost,
            support: formData.resource.support,
            earlyAccess: formData.resource.earlyAccess,
            privateGroup: formData.resource.privateGroup,
            rankingBoard: formData.resource.rankingBoard,
            discordRole: formData.resource.discordRole,
            referrals: formData.referrals,
            referrals_earn: formData.referrals_earn,
          },
          language: descriptionLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedDescription({
          description: data.description,
          shortDescription: data.shortDescription,
        });
        toast.success('Description generated');
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
      toast.error('Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  const openEditDialog = (bundle: PremiumBundle) => {
    setEditingBundle(bundle);
    setFormData({
      title: bundle.title,
      price: bundle.price,
      price_twa: bundle.price_twa,
      level: bundle.level,
      boost: bundle.boost,
      referrals: bundle.referrals,
      referrals_earn: bundle.referrals_earn,
      resource: {
        support: bundle.resource?.support || false,
        earlyAccess: bundle.resource?.earlyAccess || false,
        privateGroup: bundle.resource?.privateGroup || false,
        rankingBoard: bundle.resource?.rankingBoard || false,
        discordRole: bundle.resource?.discordRole || '',
      },
    });
    setGeneratedDescription(null);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingBundle(null);
    setFormData(defaultFormData);
    setGeneratedDescription(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Premium Bundles</h1>
          <p className="text-muted-foreground">
            Manage premium subscription bundles, pricing and features
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBundles}>
            <IconRefresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <IconPlus className="h-4 w-4 mr-2" />
            Create Bundle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bundles</CardTitle>
            <IconCrown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bundles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max XP Boost</CardTitle>
            <IconSparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bundles.length > 0 ? `${Math.max(...bundles.map(b => b.boost))}x` : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bundles.length > 0
                ? `$${Math.min(...bundles.map(b => b.price))} - $${Math.max(...bundles.map(b => b.price))}`
                : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Choice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bundles.find(b => b.resource?.bestChoose)?.title || 'Not set'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bundles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bundles Management</CardTitle>
          <CardDescription>Edit prices, features and set best choice</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bundles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead>Price (Stars)</TableHead>
                  <TableHead>Boost</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Best Choice</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundles.sort((a, b) => a.level - b.level).map((bundle) => (
                  <TableRow key={bundle.id}>
                    <TableCell>
                      <Badge variant="outline">Level {bundle.level}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{bundle.title}</TableCell>
                    <TableCell>${bundle.price}</TableCell>
                    <TableCell>{bundle.price_twa} ⭐</TableCell>
                    <TableCell>{bundle.boost}x</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {bundle.resource?.support && <Badge variant="secondary">Support</Badge>}
                        {bundle.resource?.earlyAccess && <Badge variant="secondary">Early Access</Badge>}
                        {bundle.resource?.privateGroup && <Badge variant="secondary">Private Group</Badge>}
                        {bundle.resource?.discordRole && <Badge variant="secondary">Discord</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={bundle.resource?.bestChoose || false}
                        onCheckedChange={(checked) => handleSetBestChoice(bundle, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(bundle)}>
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setBundleToDelete(bundle);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No bundles found. Create your first bundle!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBundle ? 'Edit Bundle' : 'Create Bundle'}</DialogTitle>
            <DialogDescription>
              {editingBundle ? 'Update bundle details and pricing' : 'Create a new premium bundle'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Premium Bundle"
                />
              </div>
              <div className="space-y-2">
                <Label>Level (0-3)</Label>
                <Input
                  type="number"
                  min={0}
                  max={3}
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (Telegram Stars)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.price_twa}
                  onChange={(e) => setFormData({ ...formData, price_twa: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>XP Boost Multiplier</Label>
                <Input
                  type="number"
                  min={1}
                  step={0.5}
                  value={formData.boost}
                  onChange={(e) => setFormData({ ...formData, boost: parseFloat(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Referral XP Bonus</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.referrals}
                  onChange={(e) => setFormData({ ...formData, referrals: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Referral Earn %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.referrals_earn}
                  onChange={(e) => setFormData({ ...formData, referrals_earn: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Features</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.resource.support}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, resource: { ...formData.resource, support: checked } })
                    }
                  />
                  <Label>Priority Support</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.resource.earlyAccess}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, resource: { ...formData.resource, earlyAccess: checked } })
                    }
                  />
                  <Label>Early Access</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.resource.privateGroup}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, resource: { ...formData.resource, privateGroup: checked } })
                    }
                  />
                  <Label>Private Group</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.resource.rankingBoard}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, resource: { ...formData.resource, rankingBoard: checked } })
                    }
                  />
                  <Label>Ranking Board</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Discord Role</Label>
                <Input
                  value={formData.resource.discordRole}
                  onChange={(e) =>
                    setFormData({ ...formData, resource: { ...formData.resource, discordRole: e.target.value } })
                  }
                  placeholder="e.g., Premium Member"
                />
              </div>
            </div>

            {/* AI Description Generator */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">AI Description Generator</Label>
                <div className="flex gap-2">
                  <Select value={descriptionLanguage} onValueChange={setDescriptionLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="uk">Українська</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleGenerateDescription} disabled={isGenerating}>
                    <IconSparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </div>

              {generatedDescription && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm">Full Description</Label>
                    <Textarea
                      value={generatedDescription.description}
                      readOnly
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Short Description (for payment gateways)</Label>
                    <Input
                      value={generatedDescription.shortDescription}
                      readOnly
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBundle}>
              {editingBundle ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bundle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{bundleToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBundle}>
              <IconTrash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
