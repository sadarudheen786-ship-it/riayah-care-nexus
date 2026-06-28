import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — RiayahOS" },
      { name: "description", content: "Secure document vault for medical records and travel paperwork." },
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
