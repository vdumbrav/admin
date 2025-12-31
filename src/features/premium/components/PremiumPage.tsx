import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, Sparkles, RefreshCw, Check, X, Loader2,
  DollarSign, Users, TrendingUp, TrendingDown, Percent,
  GripVertical, Eye, EyeOff, Database, Crown
} from 'lucide-react';
import {
  useFeatures,
  useCreateFeature,
  useUpdateFeature,
  useDeleteFeature,
  useToggleFeature,
  useGenerateFeatureDescription,
  useSeedFeatures,
  usePremiumStats,
  Feature,
  CreateFeatureDto,
  FeatureValueType,
  FeatureValues,
  TierValue,
} from '../api/admin-features';
import { useBundles, Bundle } from '../api/admin-bundles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const VALUE_TYPE_OPTIONS = [
  { value: FeatureValueType.BOOLEAN, label: 'Boolean (Yes/No)' },
  { value: FeatureValueType.TEXT, label: 'Text' },
  { value: FeatureValueType.NUMBER, label: 'Number' },
  { value: FeatureValueType.PERCENTAGE, label: 'Percentage (%)' },
  { value: FeatureValueType.CURRENCY, label: 'Currency ($)' },
  { value: FeatureValueType.XP, label: 'XP Points' },
  { value: FeatureValueType.MULTIPLIER, label: 'Multiplier (x)' },
];

const TIER_LABELS = ['Free', 'Level 1', 'Level 2', 'Level 3'];
const TIER_KEYS: (keyof FeatureValues)[] = ['free', 'level1', 'level2', 'level3'];
const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const defaultTierValue: TierValue = { enabled: false, value: undefined, displayText: '' };

const defaultFeatureValues: FeatureValues = {
  free: { ...defaultTierValue },
  level1: { ...defaultTierValue },
  level2: { ...defaultTierValue },
  level3: { ...defaultTierValue },
};

export function PremiumPage() {
  const [activeTab, setActiveTab] = useState('features');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [formData, setFormData] = useState<CreateFeatureDto>({
    key: '',
    name: '',
    description: '',
    valueType: FeatureValueType.BOOLEAN,
    values: { ...defaultFeatureValues },
    icon: '',
    tooltip: '',
    category: '',
  });

  const { data: features, isLoading: featuresLoading, refetch: refetchFeatures } = useFeatures();
  const { data: bundles, isLoading: bundlesLoading } = useBundles();
  const { data: stats, isLoading: statsLoading } = usePremiumStats();

  const createFeature = useCreateFeature();
  const updateFeature = useUpdateFeature();
  const deleteFeature = useDeleteFeature();
  const toggleFeature = useToggleFeature();
  const generateDescription = useGenerateFeatureDescription();
  const seedFeatures = useSeedFeatures();

  const handleCreateNew = () => {
    setEditingFeature(null);
    setFormData({
      key: '',
      name: '',
      description: '',
      valueType: FeatureValueType.BOOLEAN,
      values: JSON.parse(JSON.stringify(defaultFeatureValues)),
      icon: '',
      tooltip: '',
      category: '',
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      key: feature.key,
      name: feature.name,
      description: feature.description || '',
      valueType: feature.valueType,
      values: JSON.parse(JSON.stringify(feature.values)),
      icon: feature.icon || '',
      tooltip: feature.tooltip || '',
      category: feature.category || '',
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingFeature) {
        await updateFeature.mutateAsync({
          key: editingFeature.key,
          data: {
            name: formData.name,
            description: formData.description,
            valueType: formData.valueType,
            values: formData.values,
            icon: formData.icon,
            tooltip: formData.tooltip,
            category: formData.category,
          },
        });
        toast.success('Feature updated successfully');
      } else {
        await createFeature.mutateAsync(formData);
        toast.success('Feature created successfully');
      }
      setEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save feature');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    try {
      await deleteFeature.mutateAsync(key);
      toast.success('Feature deleted');
    } catch (error) {
      toast.error('Failed to delete feature');
    }
  };

  const handleToggle = async (key: string) => {
    try {
      await toggleFeature.mutateAsync(key);
      toast.success('Feature toggled');
    } catch (error) {
      toast.error('Failed to toggle feature');
    }
  };

  const handleGenerateDescription = async () => {
    try {
      const result = await generateDescription.mutateAsync({
        name: formData.name,
        valueType: formData.valueType,
        language: 'en',
      });
      setFormData(prev => ({
        ...prev,
        description: result.description,
        tooltip: result.tooltip,
      }));
      toast.success('Description generated');
    } catch (error) {
      toast.error('Failed to generate description');
    }
  };

  const handleSeedDefaults = async () => {
    try {
      const result = await seedFeatures.mutateAsync();
      toast.success(`Seeded ${result.seeded} default features`);
    } catch (error) {
      toast.error('Failed to seed features');
    }
  };

  const updateTierValue = (tier: keyof FeatureValues, field: keyof TierValue, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [tier]: {
          ...prev.values[tier],
          [field]: value,
        },
      },
    }));
  };

  const renderTierValue = (feature: Feature, tier: keyof FeatureValues) => {
    const tierValue = feature.values[tier];
    if (!tierValue.enabled) {
      return <span className="text-muted-foreground">--</span>;
    }
    if (tierValue.displayText) {
      return tierValue.displayText;
    }
    if (feature.valueType === FeatureValueType.BOOLEAN) {
      return tierValue.value ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />;
    }
    return String(tierValue.value || '--');
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Premium Management</h1>
          <p className="text-muted-foreground">Manage subscription features, bundles and view analytics</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Manage premium features displayed in subscription comparison table. Tooltip will be shown as info icon.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSeedDefaults} disabled={seedFeatures.isPending}>
                {seedFeatures.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                Seed Defaults
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetchFeatures()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {featuresLoading ? (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Feature</TableHead>
                      <TableHead>Type</TableHead>
                      {TIER_LABELS.map(label => (
                        <TableHead key={label} className="text-center">{label}</TableHead>
                      ))}
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {features?.map(feature => (
                      <TableRow key={feature.key}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{feature.name}</p>
                            {feature.tooltip && (
                              <p className="text-xs text-muted-foreground truncate max-w-[250px]" title={feature.tooltip}>
                                {feature.tooltip}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{feature.valueType}</Badge>
                        </TableCell>
                        {TIER_KEYS.map(tier => (
                          <TableCell key={tier} className="text-center">
                            {renderTierValue(feature, tier)}
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(feature.key)}
                          >
                            {feature.enabled ? (
                              <Eye className="h-4 w-4 text-green-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(feature)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(feature.key)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!features || features.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No features configured. Click "Seed Defaults" to add default features.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bundles Tab */}
        <TabsContent value="bundles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Bundles</CardTitle>
              <CardDescription>
                The subscription is valid for 30 days. Payments are accepted in various cryptocurrencies, including Bitcoin, Ethereum, Tether, USD Coin, and others.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bundlesLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Price (USD)</TableHead>
                      <TableHead>Price (Stars)</TableHead>
                      <TableHead>XP Boost</TableHead>
                      <TableHead>Referral XP</TableHead>
                      <TableHead>Affiliate %</TableHead>
                      <TableHead>Best Choice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bundles?.sort((a: Bundle, b: Bundle) => a.level - b.level).map((bundle: Bundle) => (
                      <TableRow key={bundle.id}>
                        <TableCell>
                          <Badge variant={bundle.resource?.bestChoose ? 'default' : 'outline'}>
                            {bundle.level === 0 ? 'Free' : `Level ${bundle.level}`}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{bundle.title}</TableCell>
                        <TableCell>{bundle.price === 0 ? 'Free' : `$${bundle.price}`}</TableCell>
                        <TableCell>{bundle.price_twa} Stars</TableCell>
                        <TableCell>x{bundle.boost}</TableCell>
                        <TableCell>{bundle.referrals} XP</TableCell>
                        <TableCell>{bundle.referrals_earn}%</TableCell>
                        <TableCell>
                          {bundle.resource?.bestChoose && <Crown className="h-4 w-4 text-yellow-500" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          {statsLoading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : stats ? (
            <>
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.overview.totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days: ${stats.overview.revenueLast30Days.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.overview.totalSubscriptions}</div>
                    <p className="text-xs text-muted-foreground">All time purchases</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Revenue Change</CardTitle>
                    {stats.overview.revenueChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stats.overview.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stats.overview.revenueChange >= 0 ? '+' : ''}{stats.overview.revenueChange}%
                    </div>
                    <p className="text-xs text-muted-foreground">vs previous 30 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.overview.churnRate}%</div>
                    <p className="text-xs text-muted-foreground">Last 90 days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Daily revenue over last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscriptions by Level</CardTitle>
                    <CardDescription>Active subscribers distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="title"
                          label={({ title, count }) => count > 0 ? `${title}: ${count}` : ''}
                        >
                          {stats.distribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscriptions Trend</CardTitle>
                    <CardDescription>Daily new subscriptions</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="subscriptions" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Users by Level</CardTitle>
                    <CardDescription>Current subscribers per tier</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.byLevel} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={12} />
                        <YAxis dataKey="title" type="category" fontSize={12} width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="activeUsers" fill="#8884d8" name="Active Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Subscriptions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Subscriptions</CardTitle>
                  <CardDescription>Latest subscription purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Bundle</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentSubscriptions.length > 0 ? stats.recentSubscriptions.map(sub => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sub.userNickname}</p>
                              <p className="text-xs text-muted-foreground">{sub.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{sub.bundleTitle}</Badge>
                          </TableCell>
                          <TableCell>${sub.amount} {sub.currency}</TableCell>
                          <TableCell>
                            <Badge variant={sub.status === 'paid' ? 'default' : 'secondary'}>
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No subscriptions yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No premium statistics available
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit/Create Feature Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFeature ? 'Edit Feature' : 'Create Feature'}</DialogTitle>
            <DialogDescription>
              Configure feature settings and values for each subscription tier
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Key (unique identifier)</Label>
                <Input
                  value={formData.key}
                  onChange={e => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  disabled={!!editingFeature}
                  placeholder="e.g., xp_boost"
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., XP Boost multiplicator"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Value Type</Label>
                <Select
                  value={formData.valueType}
                  onValueChange={(v: FeatureValueType) => setFormData(prev => ({ ...prev, valueType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUE_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., rewards, access, visibility"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={!formData.name || generateDescription.isPending}
                >
                  {generateDescription.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the feature"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Tooltip (info icon text)</Label>
              <Textarea
                value={formData.tooltip}
                onChange={e => setFormData(prev => ({ ...prev, tooltip: e.target.value }))}
                placeholder="e.g., A percentage of the subscription payment that you earn from every purchase made by your referrals"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon (Lucide icon name)</Label>
              <Input
                value={formData.icon}
                onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="e.g., Zap, Users, Percent, Trophy"
              />
            </div>

            <div className="space-y-4">
              <Label>Tier Values</Label>
              <div className="grid grid-cols-4 gap-4">
                {TIER_KEYS.map((tier, idx) => (
                  <Card key={tier} className="p-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{TIER_LABELS[idx]}</span>
                        <Switch
                          checked={formData.values[tier]?.enabled || false}
                          onCheckedChange={v => updateTierValue(tier, 'enabled', v)}
                        />
                      </div>
                      {formData.values[tier]?.enabled && (
                        <>
                          {formData.valueType === FeatureValueType.BOOLEAN ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={formData.values[tier]?.value as boolean || false}
                                onCheckedChange={v => updateTierValue(tier, 'value', v)}
                              />
                              <span className="text-sm">Value</span>
                            </div>
                          ) : (
                            <Input
                              type={[FeatureValueType.NUMBER, FeatureValueType.PERCENTAGE, FeatureValueType.CURRENCY, FeatureValueType.XP, FeatureValueType.MULTIPLIER].includes(formData.valueType) ? 'number' : 'text'}
                              value={formData.values[tier]?.value as string || ''}
                              onChange={e => updateTierValue(tier, 'value', formData.valueType === FeatureValueType.TEXT ? e.target.value : Number(e.target.value))}
                              placeholder="Value"
                              className="h-8"
                            />
                          )}
                          <Input
                            value={formData.values[tier]?.displayText || ''}
                            onChange={e => updateTierValue(tier, 'displayText', e.target.value)}
                            placeholder="Display text"
                            className="h-8"
                          />
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createFeature.isPending || updateFeature.isPending}>
              {(createFeature.isPending || updateFeature.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingFeature ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
