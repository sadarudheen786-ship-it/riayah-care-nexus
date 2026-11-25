import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/communication")({
  head: () => ({
    meta: [
      { title: "Communication — RiayahOS" },
      { name: "description", content: "Unified inbox across WhatsApp, email and calls." },
      { property: "og:title", content: "Communication — RiayahOS" },
      { property: "og:description", content: "Unified inbox across WhatsApp, email and calls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Communication"
      description="Unified inbox across WhatsApp, email and calls."
      eyebrow="Module"
    />
  ),
});
