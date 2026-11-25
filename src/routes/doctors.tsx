import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Doctors — RiayahOS" },
      { name: "description", content: "Verified specialist directory with credentials and availability." },
      { property: "og:title", content: "Doctors — RiayahOS" },
      { property: "og:description", content: "Verified specialist directory with credentials and availability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Doctors"
      description="Verified specialist directory with credentials and availability."
      eyebrow="Module"
    />
  ),
});
