import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/hospitals")({
  head: () => ({
    meta: [
      { title: "Hospitals — RiayahOS" },
      { name: "description", content: "Partner hospital network across Kerala, India." },
      { property: "og:title", content: "Hospitals — RiayahOS" },
      { property: "og:description", content: "Partner hospital network across Kerala, India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Hospitals"
      description="Partner hospital network across Kerala, India."
      eyebrow="Module"
    />
  ),
});
