import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Lead Management — RiayahOS" },
      { name: "description", content: "Capture, qualify and route patient inquiries from across the GCC." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Lead Management"
      description="Capture, qualify and route patient inquiries from across the GCC."
      eyebrow="Module"
    />
  ),
});
