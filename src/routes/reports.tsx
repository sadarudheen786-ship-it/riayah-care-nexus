import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — RiayahOS" },
      { name: "description", content: "Operational and executive reporting across modules." },
      { property: "og:title", content: "Reports — RiayahOS" },
      { property: "og:description", content: "Operational and executive reporting across modules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
