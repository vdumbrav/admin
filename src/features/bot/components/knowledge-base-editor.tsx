import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useKnowledgeBase, useUpdateKnowledgeEntry, useDeleteKnowledgeEntry } from '../api/admin-bot';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, Book, CheckCircle2, Circle } from 'lucide-react';
import type { KnowledgeResponse } from '../types';

// Default knowledge topics with descriptions
const DEFAULT_TOPICS = [
  { key: 'bitcoin', name: 'Bitcoin', description: 'Information about Bitcoin (BTC)' },
  { key: 'ethereum', name: 'Ethereum', description: 'Information about Ethereum (ETH)' },
  { key: 'defiBasics', name: 'DeFi Basics', description: 'Decentralized finance fundamentals' },
  { key: 'staking', name: 'Staking', description: 'Staking concepts and strategies' },
  { key: 'layer2', name: 'Layer 2', description: 'L2 scaling solutions' },
  { key: 'slangDictionary', name: 'Crypto Slang', description: 'Common crypto terminology' },
];

interface EntryCardProps {
  topic: string;
  name: string;
  description?: string;
  content?: string;
  isConfigured: boolean;
  updatedAt?: string;
  onEdit: () => void;
  onDelete?: () => void;
}

function EntryCard({ topic, name, description, content, isConfigured, updatedAt, onEdit, onDelete }: EntryCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors hover:border-primary/50 ${isConfigured ? 'border-green-500/50' : ''}`}
      onClick={onEdit}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-base">{name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-xs">
          {description || `Key: ${topic}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content ? (
          <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Not configured - using default</p>
        )}
        {updatedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Updated: {new Date(updatedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function KnowledgeBaseEditor() {
  const { data, isLoading, refetch } = useKnowledgeBase();
  const updateEntry = useUpdateKnowledgeEntry();
  const deleteEntry = useDeleteKnowledgeEntry();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [form, setForm] = useState({
    key: '',
    content: '',
  });

  // Cast data to correct type
  const knowledge = data as KnowledgeResponse | undefined;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const handleOpenDialog = (topic: string, existingContent?: string) => {
    setEditingTopic(topic);
    setForm({
      key: topic,
      content: existingContent || '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenNewDialog = () => {
    setEditingTopic(null);
    setForm({ key: '', content: '' });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.key || !form.content) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await updateEntry.mutateAsync({ key: form.key, content: form.content });
      toast.success('Knowledge entry saved');
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to save entry');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Delete this custom knowledge entry?')) return;

    try {
      await deleteEntry.mutateAsync(key);
      toast.success('Entry deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  // Get topic info
  const getTopicInfo = (key: string) => {
    const defaultInfo = DEFAULT_TOPICS.find(t => t.key === key);
    return defaultInfo || { key, name: key, description: `Custom topic: ${key}` };
  };

  // Combine default and custom topics
  const allTopics = [
    ...DEFAULT_TOPICS.map(t => ({
      ...t,
      content: knowledge?.customEntries?.[t.key]?.content,
      updatedAt: knowledge?.customEntries?.[t.key]?.updatedAt,
      isConfigured: !!knowledge?.customEntries?.[t.key],
      isDefault: true,
    })),
    // Add custom topics that aren't in defaults
    ...Object.entries(knowledge?.customEntries || {})
      .filter(([key]) => !DEFAULT_TOPICS.some(t => t.key === key))
      .map(([key, entry]) => ({
        key,
        name: key,
        description: `Custom topic`,
        content: entry.content,
        updatedAt: entry.updatedAt,
        isConfigured: true,
        isDefault: false,
      })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {knowledge?.totalEntries || 0} knowledge entries
          </p>
          <p className="text-xs text-muted-foreground">
            Configure knowledge that the AI uses to answer questions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                {editingTopic ? `Edit: ${getTopicInfo(editingTopic).name}` : 'Add Custom Topic'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!editingTopic && (
                <div>
                  <Label>Topic Key (unique identifier)</Label>
                  <Input
                    value={form.key}
                    onChange={(e) => setForm(f => ({ ...f, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                    placeholder="e.g., solana, nft_basics"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use lowercase letters and underscores
                  </p>
                </div>
              )}

              <div>
                <Label>Content</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder={`Enter knowledge content about ${editingTopic || 'this topic'}...

Example:
Solana (SOL) - high-performance blockchain.

Facts:
- Transaction speed: 65,000 TPS
- Low fees: ~$0.00025 per transaction
- Proof of History consensus

Use cases:
- DeFi (Raydium, Marinade)
- NFTs (Magic Eden)
- Gaming`}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateEntry.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateEntry.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Default Topics Section */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Book className="h-4 w-4" />
          Core Knowledge Topics
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allTopics.filter(t => t.isDefault).map((topic) => (
            <EntryCard
              key={topic.key}
              topic={topic.key}
              name={topic.name}
              description={topic.description}
              content={topic.content}
              isConfigured={topic.isConfigured}
              updatedAt={topic.updatedAt}
              onEdit={() => handleOpenDialog(topic.key, topic.content)}
            />
          ))}
        </div>
      </div>

      {/* Custom Topics Section */}
      {allTopics.some(t => !t.isDefault) && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Custom Topics
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allTopics.filter(t => !t.isDefault).map((topic) => (
              <EntryCard
                key={topic.key}
                topic={topic.key}
                name={topic.name}
                description={topic.description}
                content={topic.content}
                isConfigured={topic.isConfigured}
                updatedAt={topic.updatedAt}
                onEdit={() => handleOpenDialog(topic.key, topic.content)}
                onDelete={() => handleDelete(topic.key)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
