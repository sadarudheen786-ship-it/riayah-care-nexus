import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance — RiayahOS" },
      { name: "description", content: "Invoicing, settlements and revenue across all engagements." },
      { property: "og:title", content: "Finance — RiayahOS" },
      { property: "og:description", content: "Invoicing, settlements and revenue across all engagements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
