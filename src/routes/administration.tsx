import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/administration")({
  head: () => ({
    meta: [
      { title: "Administration — RiayahOS" },
      { name: "description", content: "Roles, users, audit logs and organizational controls." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Administration"
      description="Roles, users, audit logs and organizational controls."
      eyebrow="Module"
    />
  ),
});
