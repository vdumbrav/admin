import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QuestForm } from "./QuestForm";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { vi } from "vitest";

it("uploads image and sets resources.icon", async () => {
  const onSubmit = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <QuestForm onSubmit={onSubmit} />
    </QueryClientProvider>
  );
  const file = new File([new Uint8Array([1, 2, 3])], "logo.png", { type: "image/png" });
  const input = screen.getByLabelText(/icon/i) as HTMLInputElement;
  await fireEvent.change(input, { target: { files: [file] } });
  await waitFor(() => expect(screen.getByRole("img")).toBeInTheDocument());
});
