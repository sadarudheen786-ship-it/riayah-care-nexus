import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/communication")({
  head: () => ({
    meta: [
      { title: "Communication — RiayahOS" },
      { name: "description", content: "Unified inbox across WhatsApp, email and calls." },
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
