import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/disease-engine")({
  head: () => ({
    meta: [
      { title: "Disease Engine — RiayahOS" },
      { name: "description", content: "Structured disease library powering recommendations across the platform." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Disease Engine"
      description="Structured disease library powering recommendations across the platform."
      eyebrow="Module"
    />
  ),
});
