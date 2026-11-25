import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — RiayahOS" },
      { name: "description", content: "Secure document vault for medical records and travel paperwork." },
      { property: "og:title", content: "Documents — RiayahOS" },
      { property: "og:description", content: "Secure document vault for medical records and travel paperwork." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Documents"
      description="Secure document vault for medical records and travel paperwork."
      eyebrow="Module"
    />
  ),
});
