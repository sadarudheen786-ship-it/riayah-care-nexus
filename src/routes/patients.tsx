import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/patients")({
  head: () => ({
    meta: [
      { title: "Patients — RiayahOS" },
      { name: "description", content: "Complete patient records, journey timelines and care coordination." },
      { property: "og:title", content: "Patients — RiayahOS" },
      { property: "og:description", content: "Complete patient records, journey timelines and care coordination." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
