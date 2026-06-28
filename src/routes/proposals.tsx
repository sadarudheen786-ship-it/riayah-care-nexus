import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/proposals")({
  head: () => ({
    meta: [
      { title: "Proposal Center — RiayahOS" },
      { name: "description", content: "Build, send and track personalized treatment proposals." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Proposal Center"
      description="Build, send and track personalized treatment proposals."
      eyebrow="Module"
    />
  ),
});
