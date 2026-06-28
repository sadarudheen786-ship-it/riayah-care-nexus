import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — RiayahOS" },
      { name: "description", content: "Workspace preferences and integrations." },
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
