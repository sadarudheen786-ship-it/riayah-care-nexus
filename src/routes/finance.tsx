import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance — RiayahOS" },
      { name: "description", content: "Invoicing, settlements and revenue across all engagements." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Finance"
      description="Invoicing, settlements and revenue across all engagements."
      eyebrow="Module"
    />
  ),
});
