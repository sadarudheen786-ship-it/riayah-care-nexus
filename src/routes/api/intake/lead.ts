import { createFileRoute } from "@tanstack/react-router";
import { handleN8nLeadIntake } from "@/lib/intake/n8n-handler.server";

export const Route = createFileRoute("/api/intake/lead")({
  server: {
    handlers: {
      POST: async ({ request }) => handleN8nLeadIntake(request),
    },
  },
});