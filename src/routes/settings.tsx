import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — RiayahOS" },
      { name: "description", content: "Workspace preferences and integrations." },
      { property: "og:title", content: "Settings — RiayahOS" },
      { property: "og:description", content: "Workspace preferences and integrations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Settings"
      description="Workspace preferences and integrations."
      eyebrow="Module"
    />
  ),
});
