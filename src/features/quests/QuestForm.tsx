import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { uploadMedia } from "./api"
import type { Task } from "@/types/tasks"

const schema = z
  .object({
    title: z.string().min(1),
    type: z.enum([
      "referral",
      "connect",
      "join",
      "share",
      "like",
      "comment",
      "multiple",
      "repeatable",
      "dummy",
      "partner_invite",
      "external",
    ]),
    description: z.string().nullable().optional(),
    group: z.enum(["social", "daily", "referral", "partner", "all"]),
    order_by: z.number().int().nonnegative(),
    provider: z
      .enum([
        "twitter",
        "telegram",
        "discord",
        "matrix",
        "walme",
        "monetag",
        "adsgram",
      ])
      .optional(),
    uri: z.string().url().optional().or(z.literal("").transform(() => undefined)),
    reward: z.number().int().optional(),
    resources: z
      .object({
        icon: z.string().url().optional(),
        ui: z
          .object({
            button: z.string().optional(),
            "pop-up": z
              .object({
                name: z.string().optional(),
                button: z.string().optional(),
                description: z.string().optional(),
                static: z.boolean().optional(),
                "additional-title": z.string().optional(),
                "additional-description": z.string().optional(),
              })
              .partial()
              .optional(),
          })
          .partial()
          .optional(),
        adsgram: z.object({ block_id: z.string().optional() }).partial().optional(),
      })
      .partial()
      .optional(),
    visible: z.boolean().optional(),
  })
  .passthrough()

type FormValues = z.infer<typeof schema>

export function QuestForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<Task>
  onSubmit: (v: FormValues) => void
}) {
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      type: (initial?.type as Task["type"]) ?? "external",
      description: initial?.description ?? "",
      group: (initial?.group as Task["group"]) ?? "all",
      order_by: initial?.order_by ?? 0,
      provider: initial?.provider as Task["provider"],
      uri: initial?.uri ?? "",
      reward: initial?.reward ?? 0,
      resources: initial?.resources ?? {},
      visible: initial?.visible ?? true,
    },
  })

  const icon = watch("resources.icon")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label>Title</label>
          <input className="input" {...register("title")} />
        </div>
        <div>
          <label>Type</label>
          <select className="input" {...register("type")}>
            <option value="external">external</option>
            <option value="partner_invite">partner_invite</option>
          </select>
        </div>
        <div>
          <label>Group</label>
          <select className="input" {...register("group")}>
            <option value="all">all</option>
            <option value="social">social</option>
          </select>
        </div>
        <div>
          <label>Order</label>
          <input type="number" className="input" {...register("order_by", { valueAsNumber: true })} />
        </div>
        <div className="sm:col-span-2">
          <label>Description</label>
          <textarea className="input" rows={4} {...register("description")} />
        </div>
        <div>
          <label>Provider</label>
          <select className="input" {...register("provider")}>
            <option value="">—</option>
            <option value="twitter">twitter</option>
          </select>
        </div>
        <div>
          <label>URI</label>
          <input className="input" {...register("uri")} />
        </div>
        <div>
          <label>Reward</label>
          <input type="number" className="input" {...register("reward", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("visible")} /> Visible
          </label>
        </div>
        <div>
          <label>UI Button</label>
          <input className="input" {...register("resources.ui.button")} />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <label className="block">Pop-up</label>
          <input className="input" placeholder="name" {...register("resources.ui['pop-up'].name")} />
          <input className="input" placeholder="button" {...register("resources.ui['pop-up'].button")} />
          <textarea className="input" placeholder="description" {...register("resources.ui['pop-up'].description")} />
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("resources.ui['pop-up'].static")} /> static
          </label>
          <input
            className="input"
            placeholder="additional title"
            {...register("resources.ui['pop-up']['additional-title']")}
          />
          <input
            className="input"
            placeholder="additional description"
            {...register("resources.ui['pop-up']['additional-description']")}
          />
        </div>
        <div>
          <label>AdsGram Block ID</label>
          <input className="input" {...register("resources.adsgram.block_id")} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="icon-upload" className="block text-sm font-medium">Icon</label>
        {icon ? <img src={icon} className="h-16 w-16 rounded border object-contain" /> : null}
        <input
          id="icon-upload"
          type="file"
          accept="image/*"
          onChange={async e => {
            const f = e.target.files?.[0]
            if (!f) return
            const { url } = await uploadMedia(f)
            setValue("resources.icon", url, { shouldDirty: true })
          }}
        />
      </div>

      <button className="btn-primary" type="submit">
        Save
      </button>
    </form>
  )
}
