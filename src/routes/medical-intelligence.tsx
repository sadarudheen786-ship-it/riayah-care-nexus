import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/medical-intelligence")({
  head: () => ({
    meta: [
      { title: "Medical Intelligence — RiayahOS" },
      { name: "description", content: "Insights across diseases, treatments and outcomes." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Medical Intelligence"
      description="Insights across diseases, treatments and outcomes."
      eyebrow="Module"
    />
  ),
});
