import { useCreateQuest, useQuest, useUpdateQuest } from "./api";
import { QuestForm } from "./QuestForm";
import { useParams, useNavigate } from "@tanstack/react-router";
import { QuestsTable } from "./QuestsTable";

export function QuestsListPage() {
  return <QuestsTable />;
}

export function QuestCreatePage() {
  const create = useCreateQuest();
  const nav = useNavigate({});
  return (
    <QuestForm
      onSubmit={async (v: any) => {
        await create.mutateAsync(v);
        nav({ to: "/quests" as any });
      }}
    />
  );
}

export function QuestEditPage() {
  // @ts-ignore
  const { id } = useParams({ from: "/quests/$id" });
  const { data } = useQuest(Number(id));
  const update = useUpdateQuest(Number(id));
  const nav = useNavigate({});

  if (!data) return null;
  return (
      <QuestForm
        initial={data}
        onSubmit={async (v: any) => {
          await update.mutateAsync(v);
          nav({ to: "/quests" as any });
        }}
      />
  );
}
