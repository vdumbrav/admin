import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useResponseTemplates, useUpdateResponseTemplate, useDeleteResponseTemplate } from '../api/admin-bot';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, MessageSquareText } from 'lucide-react';
import type { ResponseTemplate } from '../types';

const languages = [
  { value: '', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Russian' },
  { value: 'uk', label: 'Ukrainian' },
];

export function ResponseTemplatesEditor() {
  const { data: templates, isLoading, refetch } = useResponseTemplates();
  const updateTemplate = useUpdateResponseTemplate();
  const deleteTemplate = useDeleteResponseTemplate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<string | null>(null);
  const [form, setForm] = useState<ResponseTemplate>({
    trigger: '',
    response: '',
    language: '',
    exact: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const templateList = Object.entries(templates || {}).map(([triggerKey, template]) => ({
    ...template,
    trigger: triggerKey,
  }));

  const handleOpenDialog = (template?: ResponseTemplate & { trigger: string }) => {
    if (template) {
      setEditingTrigger(template.trigger);
      setForm({
        trigger: template.trigger,
        response: template.response,
        language: template.language || '',
        exact: template.exact || false,
      });
    } else {
      setEditingTrigger(null);
      setForm({ trigger: '', response: '', language: '', exact: false });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.trigger || !form.response) {
      toast.error('Trigger and response are required');
      return;
    }

    try {
      await updateTemplate.mutateAsync(form);
      toast.success(editingTrigger ? 'Template updated' : 'Template added');
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (trigger: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      await deleteTemplate.mutateAsync(trigger);
      toast.success('Template deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {templateList.length} automatic response templates
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTrigger ? 'Edit Response Template' : 'Add Response Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Trigger Text</Label>
                <Input
                  value={form.trigger}
                  onChange={(e) => setForm(f => ({ ...f, trigger: e.target.value }))}
                  placeholder="e.g., hello, help, support..."
                  disabled={!!editingTrigger}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  When user message contains this text, bot responds automatically
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Language</Label>
                  <Select value={form.language || ''} onValueChange={(v) => setForm(f => ({ ...f, language: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value || 'all'}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Exact Match</Label>
                    <p className="text-xs text-muted-foreground">
                      Require exact message match
                    </p>
                  </div>
                  <Switch
                    checked={form.exact || false}
                    onCheckedChange={(v) => setForm(f => ({ ...f, exact: v }))}
                  />
                </div>
              </div>

              <div>
                <Label>Response</Label>
                <Textarea
                  value={form.response}
                  onChange={(e) => setForm(f => ({ ...f, response: e.target.value }))}
                  placeholder="Bot response message..."
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports Markdown formatting
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateTemplate.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateTemplate.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trigger</TableHead>
            <TableHead>Response</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Match Type</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templateList.map((template) => (
            <TableRow key={template.trigger}>
              <TableCell className="font-mono">{template.trigger}</TableCell>
              <TableCell className="max-w-xs truncate">
                {template.response.substring(0, 50)}...
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {template.language || 'All'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={template.exact ? 'default' : 'secondary'}>
                  {template.exact ? 'Exact' : 'Contains'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(template.trigger)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {templateList.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No templates yet. Create your first automatic response.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
