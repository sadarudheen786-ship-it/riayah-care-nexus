import { createFileRoute } from "@tanstack/react-router";
import {
  MessageCircle,
  Sparkles,
  Workflow,
  Facebook,
  Globe,
  Mail,
  Database,
  HardDrive,
  ShieldCheck,
  Server,
  Brain,
  Bot,
  Activity,
  Plug,
  PlugZap,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Widget } from "@/components/common/Widget";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integration Hub — RiayahOS" },
      {
        name: "description",
        content:
          "Centralized control center for WhatsApp, OpenAI, n8n, Meta, Website, Email and system health integrations.",
      },
    ],
  }),
  component: IntegrationHub,
});

type Status = "connected" | "disconnected" | "pending" | "degraded";

const STATUS: Record<
  Status,
  { label: string; dot: string; chip: string }
> = {
  connected: {
    label: "Connected",
    dot: "bg-success",
    chip: "bg-success/10 text-success border-success/20",
  },
  disconnected: {
    label: "Not Connected",
    dot: "bg-muted-foreground/40",
    chip: "bg-muted text-muted-foreground border-border",
  },
  pending: {
    label: "Pending",
    dot: "bg-warning",
    chip: "bg-warning/10 text-warning border-warning/20",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-destructive",
    chip: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function StatusChip({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        s.chip,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 py-2 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

interface IntegrationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status: Status;
  fields: { label: string; value: string }[];
  primaryAction: string;
  secondaryAction?: string;
}

function IntegrationCard({
  icon: Icon,
  title,
  description,
  status,
  fields,
  primaryAction,
  secondaryAction,
}: IntegrationCardProps) {
  return (
    <div className="surface-card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold text-foreground">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <StatusChip status={status} />
      </div>

      <div className="mt-4 flex-1">
        {fields.map((f) => (
          <Field key={f.label} label={f.label} value={f.value} />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" className="gap-1.5" disabled>
          <PlugZap className="h-3.5 w-3.5" />
          {primaryAction}
        </Button>
        {secondaryAction && (
          <Button size="sm" variant="outline" className="gap-1.5" disabled>
            <RefreshCw className="h-3.5 w-3.5" />
            {secondaryAction}
          </Button>
        )}
      </div>
    </div>
  );
}

interface HealthCardProps {
  icon: LucideIcon;
  label: string;
  status: Status;
  detail: string;
}

function HealthCard({ icon: Icon, label, status, detail }: HealthCardProps) {
  const s = STATUS[status];
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{label}</div>
            <div className="text-[11px] text-muted-foreground">{detail}</div>
          </div>
        </div>
        <span className={cn("h-2.5 w-2.5 rounded-full", s.dot)} title={s.label} />
      </div>
    </div>
  );
}

function IntegrationHub() {
  return (
    <>
      <PageHeader
        eyebrow="Module 4.1"
        title="Integration Hub"
        subtitle="Centralized control center for all external integrations — monitor status, review configuration, and prepare connections."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh All
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <IntegrationCard
          icon={MessageCircle}
          title="WhatsApp Integration"
          description="Evolution API instance for patient conversations."
          status="disconnected"
          fields={[
            { label: "Connection Status", value: "Not Connected" },
            { label: "Phone Number", value: "—" },
            { label: "Instance Name", value: "riayah-primary" },
            { label: "QR Status", value: "Awaiting Scan" },
            { label: "Last Sync", value: "Never" },
          ]}
          primaryAction="Connect"
        />

        <IntegrationCard
          icon={Sparkles}
          title="OpenAI"
          description="Medical analysis, translation and case intelligence."
          status="disconnected"
          fields={[
            { label: "Connection Status", value: "Not Connected" },
            { label: "Selected Model", value: "gpt-4.1 (default)" },
            { label: "API Health", value: "—" },
            { label: "Last API Call", value: "Never" },
            { label: "Token Usage", value: "0 / month" },
          ]}
          primaryAction="Connect"
          secondaryAction="Test"
        />

        <IntegrationCard
          icon={Workflow}
          title="n8n Automation"
          description="Workflow automation and event routing."
          status="disconnected"
          fields={[
            { label: "Connection Status", value: "Not Connected" },
            { label: "Webhook URL", value: "—" },
            { label: "Active Workflows", value: "0" },
            { label: "Last Execution", value: "Never" },
          ]}
          primaryAction="Connect"
          secondaryAction="Test Connection"
        />

        <IntegrationCard
          icon={Facebook}
          title="Meta Integration"
          description="Meta Business, WhatsApp Business & Ad Accounts."
          status="disconnected"
          fields={[
            { label: "Connection Status", value: "Not Connected" },
            { label: "Business Account", value: "—" },
            { label: "WhatsApp Business", value: "—" },
            { label: "Ad Account", value: "—" },
            { label: "Last Sync", value: "Never" },
          ]}
          primaryAction="Connect"
        />

        <IntegrationCard
          icon={Globe}
          title="Website Integration"
          description="Inbound leads from the Riayah Care website."
          status="disconnected"
          fields={[
            { label: "API Endpoint", value: "—" },
            { label: "Website Status", value: "Unknown" },
            { label: "Last Lead Received", value: "Never" },
          ]}
          primaryAction="Connect"
          secondaryAction="Test Connection"
        />

        <IntegrationCard
          icon={Mail}
          title="Email Integration"
          description="Transactional and inbound patient email."
          status="disconnected"
          fields={[
            { label: "SMTP Status", value: "Not Configured" },
            { label: "Incoming Mail", value: "Not Configured" },
            { label: "Outgoing Mail", value: "Not Configured" },
            { label: "Last Email Sent", value: "Never" },
          ]}
          primaryAction="Connect"
        />
      </div>

      <div className="mt-6">
        <Widget
          title="System Health"
          description="Live status of core RiayahOS platform services."
          actions={<StatusChip status="connected" />}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <HealthCard
              icon={Database}
              label="Database"
              status="connected"
              detail="Primary — Lovable Cloud"
            />
            <HealthCard
              icon={HardDrive}
              label="Storage"
              status="connected"
              detail="Object storage online"
            />
            <HealthCard
              icon={ShieldCheck}
              label="Authentication"
              status="connected"
              detail="Auth service ready"
            />
            <HealthCard
              icon={Server}
              label="API"
              status="connected"
              detail="Edge functions healthy"
            />
            <HealthCard
              icon={Brain}
              label="AI"
              status="disconnected"
              detail="Awaiting OpenAI connection"
            />
            <HealthCard
              icon={Bot}
              label="Automation"
              status="disconnected"
              detail="n8n not connected"
            />
            <HealthCard
              icon={Plug}
              label="Integrations"
              status="pending"
              detail="0 of 6 connected"
            />
            <HealthCard
              icon={Activity}
              label="Overall System"
              status="degraded"
              detail="Integrations pending setup"
            />
          </div>
        </Widget>
      </div>
    </>
  );
}
