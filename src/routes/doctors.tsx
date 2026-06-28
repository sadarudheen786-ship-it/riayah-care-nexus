import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Doctors — RiayahOS" },
      { name: "description", content: "Verified specialist directory with credentials and availability." },
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
