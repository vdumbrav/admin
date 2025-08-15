import { useCreateQuest, useQuest, useUpdateQuest } from "../api";
import { QuestForm } from "../QuestForm";
import { useParams, useNavigate } from "@tanstack/react-router";
import { QuestsTable } from "../QuestsTable";

export function QuestsListPage() {
  return <QuestsTable />;
}

export function QuestCreatePage() {
  const create = useCreateQuest();
  const nav = useNavigate();
  return (
    <QuestForm
      onSubmit={async (v) => {
        await create.mutateAsync(v);
        nav({ to: "/quests" });
      }}
    />
  );
}

export function QuestEditPage() {
  const { id } = useParams({ from: "/quests/$id" });
  const { data } = useQuest(Number(id));
  const update = useUpdateQuest();
  const nav = useNavigate();

  if (!data) return null;
  return (
    <QuestForm
      initial={data}
      onSubmit={async (v) => {
        await update.mutateAsync({ id: data.id, data: v });
        nav({ to: "/quests" });
      }}
    />
  );
}
