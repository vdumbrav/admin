import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useKnowledgeBase, useUpdateKnowledgeEntry, useDeleteKnowledgeEntry } from '../api/admin-bot';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, Book } from 'lucide-react';
import type { KnowledgeEntry } from '../types';

const categories = [
  'general',
  'cryptocurrency',
  'walme',
  'commands',
  'faq',
  'legal',
];

function KnowledgeEntryCard({ entry, onEdit, onDelete }: {
  entry: KnowledgeEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Book className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">{entry.name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Key: {entry.key}</p>
          {entry.category && (
            <Badge variant="outline" className="mt-2">{entry.category}</Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
        {entry.content}
      </p>
    </div>
  );
}

export function KnowledgeBaseEditor() {
  const { data: knowledge, isLoading, refetch } = useKnowledgeBase();
  const updateEntry = useUpdateKnowledgeEntry();
  const deleteEntry = useDeleteKnowledgeEntry();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [form, setForm] = useState({
    key: '',
    name: '',
    content: '',
    category: 'general',
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const entries = Object.entries(knowledge || {}).map(([entryKey, entry]) => ({
    ...entry,
    key: entryKey,
  }));

  const handleOpenDialog = (entry?: KnowledgeEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setForm({
        key: entry.key,
        name: entry.name,
        content: entry.content,
        category: entry.category || 'general',
      });
    } else {
      setEditingEntry(null);
      setForm({ key: '', name: '', content: '', category: 'general' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.key || !form.name || !form.content) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await updateEntry.mutateAsync(form);
      toast.success(editingEntry ? 'Entry updated' : 'Entry added');
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to save entry');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteEntry.mutateAsync(key);
      toast.success('Entry deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {entries.length} knowledge entries
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Key (unique identifier)</Label>
                  <Input
                    value={form.key}
                    onChange={(e) => setForm(f => ({ ...f, key: e.target.value }))}
                    placeholder="e.g., walme_intro"
                    disabled={!!editingEntry}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Walme Introduction"
                />
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Knowledge content that the AI will use..."
                  className="min-h-[200px]"
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

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((entry) => (
          <KnowledgeEntryCard
            key={entry.key}
            entry={entry}
            onEdit={() => handleOpenDialog(entry)}
            onDelete={() => handleDelete(entry.key)}
          />
        ))}
        {entries.length === 0 && (
          <p className="col-span-2 text-center text-muted-foreground py-8">
            No knowledge entries yet. Add your first entry.
          </p>
        )}
      </div>
    </div>
  );
}
