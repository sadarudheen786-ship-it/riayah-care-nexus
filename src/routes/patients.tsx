import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/patients")({
  head: () => ({
    meta: [
      { title: "Patients — RiayahOS" },
      { name: "description", content: "Complete patient records, journey timelines and care coordination." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Patients"
      description="Complete patient records, journey timelines and care coordination."
      eyebrow="Module"
    />
  ),
});
