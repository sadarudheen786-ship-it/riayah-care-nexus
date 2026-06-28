import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — RiayahOS" },
      { name: "description", content: "Operational and executive reporting across modules." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Reports"
      description="Operational and executive reporting across modules."
      eyebrow="Module"
    />
  ),
});
