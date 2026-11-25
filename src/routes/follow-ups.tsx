import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/follow-ups")({
  head: () => ({
    meta: [
      { title: "Follow-ups — RiayahOS" },
      { name: "description", content: "Scheduled patient and lead follow-ups across teams." },
      { property: "og:title", content: "Follow-ups — RiayahOS" },
      { property: "og:description", content: "Scheduled patient and lead follow-ups across teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Follow-ups"
      description="Scheduled patient and lead follow-ups across teams."
      eyebrow="Module"
    />
  ),
});
