import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuests, useToggleVisibility, useDeleteQuest } from "./api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types/tasks";

export function QuestsTable() {
  const { data, isLoading } = useQuests({ page: 1, size: 50 });
  const toggle = useToggleVisibility();
  const del = useDeleteQuest();

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      { header: "Title", accessorKey: "title" },
      { header: "Type", accessorKey: "type" },
      { header: "Group", accessorKey: "group" },
      { header: "Provider", accessorKey: "provider" },
      { header: "Order", accessorKey: "order_by" },
      {
        header: "Visible",
        cell: ({ row }) => (
          <Switch
            checked={row.original.visible ?? true}
            onCheckedChange={(v) => toggle.mutate({ id: row.original.id, visible: v })}
          />
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="secondary">
              <a href={`/quests/${row.original.id}`}>Edit</a>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => del.mutate(row.original.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [toggle, del]
  );

  if (isLoading) return <div>Loading…</div>;
  return <YourDataTableComponent columns={columns} data={data?.items ?? []} />;
}
