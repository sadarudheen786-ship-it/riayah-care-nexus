import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/hospital-opinions")({
  head: () => ({
    meta: [
      { title: "Hospital Opinions — RiayahOS" },
      { name: "description", content: "Second opinions and structured feedback from partner hospitals." },
      { property: "og:title", content: "Hospital Opinions — RiayahOS" },
      { property: "og:description", content: "Second opinions and structured feedback from partner hospitals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Hospital Opinions"
      description="Second opinions and structured feedback from partner hospitals."
      eyebrow="Module"
    />
  ),
});
