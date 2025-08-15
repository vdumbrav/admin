import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiFetch } from "@/lib/apiFetch";
import type { Task } from "@/types/tasks";

export type QuestsQuery = { search?: string; group?: string; page?: number; size?: number };

export function useQuests(params: QuestsQuery) {
  const api = useApiFetch();
  return useQuery({
    queryKey: ["quests", params],
    queryFn: () =>
      api<{ items: Task[]; total: number }>(
        `/admin/quests?search=${params.search ?? ""}&group=${params.group ?? ""}&page=${params.page ?? 1}&size=${params.size ?? 20}`
      ),
  });
}

export function useCreateQuest() {
  const api = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Task>) =>
      api<Task>("/admin/quests", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quests"] }),
  });
}

export function useUpdateQuest() {
  const api = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
      api<Task>(`/admin/quests/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["quests"] });
      qc.invalidateQueries({ queryKey: ["quest", v.id] });
    },
  });
}

export function useDeleteQuest() {
  const api = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<void>(`/admin/quests/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quests"] }),
  });
}

export function useQuest(id: number) {
  const api = useApiFetch();
  return useQuery({
    queryKey: ["quest", id],
    queryFn: () => api<Task>(`/admin/quests/${id}`),
    enabled: !!id,
  });
}

export function useToggleVisibility() {
  const api = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      api<Task>(`/admin/quests/${id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ visible }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quests"] }),
  });
}

export function useUploadMedia() {
  const api = useApiFetch();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api<{ url: string }>("/admin/media", {
        method: "POST",
        body: fd,
        asFormData: true,
      });
    },
  });
}
