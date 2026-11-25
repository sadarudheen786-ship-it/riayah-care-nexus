import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/medical-intelligence")({
  head: () => ({
    meta: [
      { title: "Medical Intelligence — RiayahOS" },
      { name: "description", content: "Insights across diseases, treatments and outcomes." },
      { property: "og:title", content: "Medical Intelligence — RiayahOS" },
      { property: "og:description", content: "Insights across diseases, treatments and outcomes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
