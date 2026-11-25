import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/proposals")({
  head: () => ({
    meta: [
      { title: "Proposal Center — RiayahOS" },
      { name: "description", content: "Build, send and track personalized treatment proposals." },
      { property: "og:title", content: "Proposal Center — RiayahOS" },
      { property: "og:description", content: "Build, send and track personalized treatment proposals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
