import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/hospital-opinions")({
  head: () => ({
    meta: [
      { title: "Hospital Opinions — RiayahOS" },
      { name: "description", content: "Second opinions and structured feedback from partner hospitals." },
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
