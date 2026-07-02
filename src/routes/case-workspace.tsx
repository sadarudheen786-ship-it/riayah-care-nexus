import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Phone,
  MessageCircle,
  Mail,
  Share2,
  Pencil,
  Lock,
  Sparkles,
  Upload,
  UserPlus,
  FileText,
  CheckCircle2,
  CalendarClock,
  MessageSquareQuote,
  XCircle,
  Activity,
  Heart,
  AlertTriangle,
  FileImage,
  FileVideo,
  Mic,
  Paperclip,
  ClipboardList,
  StickyNote,
  History,
  LayoutGrid,
  FolderOpen,
  MessagesSquare,
  Plane,
  Building2,
  Stethoscope,
  Wallet,
  Download,
  Eye,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Widget } from "@/components/common/Widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { countryFlag } from "@/lib/flags";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/case-workspace")({
  head: () => ({
    meta: [
      { title: "Case Workspace — RiayahOS" },
      {
        name: "description",
        content:
          "The single source of truth for every Riayah Care case: unified profile, medical reports, communications, tasks, documents and timeline evolving through the full patient lifecycle.",
      },
    ],
  }),
  component: CaseWorkspace,
});

// ────────────────────────────────────────────────────────────────
// Case lifecycle
// ────────────────────────────────────────────────────────────────

const LIFECYCLE = [
  "Lead Created",
  "Contacted",
  "Reports Requested",
  "Reports Received",
  "Medical Review",
  "Hospital Opinion Requested",
  "Hospital Opinion Received",
  "Quotation Generated",
  "Patient Decision",
  "Case Activated",
  "Travel Coordination",
  "Treatment",
  "Recovery",
  "Follow-up",
  "Case Closed",
] as const;

type Stage = (typeof LIFECYCLE)[number];

// Demo record — before Supabase wiring this is the shape used by every
// downstream module (Hospital Opinions, Proposals, Travel, Finance, etc.)
const CASE = {
  patientName: "Ahmed Al-Farsi",
  caseId: "RC-2026-01847",
  leadId: "LD-2026-04120",
  country: "Oman",
  nationality: "Omani",
  language: "Arabic",
  gender: "Male",
  age: 54,
  passport: "OM-8842197",
  phone: "+968 9123 4567",
  whatsapp: "+968 9123 4567",
  email: "a.alfarsi@example.com",
  leadSource: "WhatsApp",
  caseType: "Surgery" as
    | "Second Opinion"
    | "OP Consultation"
    | "Diagnostics"
    | "Day Care"
    | "Admission"
    | "Surgery"
    | "Follow-up"
    | "Medical Package"
    | "Health Check-up",
  disease: "Coronary Artery Disease",
  urgency: "High" as "Critical" | "Emergency" | "High" | "Medium" | "Low",
  coordinator: { name: "Fatima Rahman", initials: "FR" },
  currentStage: "Hospital Opinion Received" as Stage,
  currentStatus: "Awaiting patient decision on Aster Medcity quotation",
  createdDate: "12 Jun 2026",
  lastUpdated: "2 Jul 2026 · 09:14",
  healthScore: "Needs Attention" as "Healthy" | "Needs Attention" | "Critical",
  hospital: "Aster Medcity, Kochi",
  doctor: "Dr. Rajesh Menon · Cardiothoracic Surgery",
};

const ACTIVE_STAGES: Stage[] = [
  "Case Activated",
  "Travel Coordination",
  "Treatment",
  "Recovery",
  "Follow-up",
  "Case Closed",
];
const IS_ACTIVE = ACTIVE_STAGES.includes(CASE.currentStage);

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

function CaseWorkspace() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Case Workspace"
        title={CASE.patientName}
        description="Single source of truth · every department works from this record. Tabs unlock automatically as the case progresses."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
              {CASE.caseId}
            </Badge>
            <Badge variant="outline" className="border-border">
              Lead {CASE.leadId}
            </Badge>
            <Button variant="outline" size="sm">
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
            <Button size="sm">
              <Pencil className="mr-1.5 h-4 w-4" /> Edit Case
            </Button>
          </div>
        }
      />

      <LifecycleTracker current={CASE.currentStage} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <LeftPanel />

        <div className="min-w-0">
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <div className="surface-card p-1.5">
              <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                <WorkspaceTab value="overview" icon={LayoutGrid} label="Overview" />
                <WorkspaceTab value="medical" icon={Activity} label="Medical Reports" />
                <WorkspaceTab value="communication" icon={MessagesSquare} label="Communication" />
                <WorkspaceTab value="tasks" icon={ClipboardList} label="Tasks" />
                <WorkspaceTab value="documents" icon={FolderOpen} label="Documents" />
                <WorkspaceTab value="notes" icon={StickyNote} label="Notes" />
                <WorkspaceTab value="timeline" icon={History} label="Timeline" />
                <Separator orientation="vertical" className="mx-1 h-6" />
                <WorkspaceTab
                  value="hospital-opinions"
                  icon={MessageSquareQuote}
                  label="Hospital Opinions"
                  locked={!IS_ACTIVE}
                />
                <WorkspaceTab
                  value="proposal"
                  icon={FileText}
                  label="Proposal"
                  locked={!IS_ACTIVE}
                />
                <WorkspaceTab value="travel" icon={Plane} label="Travel" locked={!IS_ACTIVE} />
                <WorkspaceTab
                  value="treatment"
                  icon={Stethoscope}
                  label="Treatment"
                  locked={!IS_ACTIVE}
                />
                <WorkspaceTab value="finance" icon={Wallet} label="Finance" locked={!IS_ACTIVE} />
                <WorkspaceTab
                  value="followup"
                  icon={CalendarClock}
                  label="Follow-up"
                  locked={!IS_ACTIVE}
                />
              </TabsList>
            </div>

            <TabsContent value="overview" className="m-0">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="medical" className="m-0">
              <MedicalTab />
            </TabsContent>
            <TabsContent value="communication" className="m-0">
              <CommunicationTab />
            </TabsContent>
            <TabsContent value="tasks" className="m-0">
              <TasksTab />
            </TabsContent>
            <TabsContent value="documents" className="m-0">
              <DocumentsTab />
            </TabsContent>
            <TabsContent value="notes" className="m-0">
              <NotesTab />
            </TabsContent>
            <TabsContent value="timeline" className="m-0">
              <TimelineTab />
            </TabsContent>
            {[
              "hospital-opinions",
              "proposal",
              "travel",
              "treatment",
              "finance",
              "followup",
            ].map((v) => (
              <TabsContent key={v} value={v} className="m-0">
                <LockedModule />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <RightPanel />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Lifecycle tracker
// ────────────────────────────────────────────────────────────────

function LifecycleTracker({ current }: { current: Stage }) {
  const idx = LIFECYCLE.indexOf(current);
  const pct = ((idx + 1) / LIFECYCLE.length) * 100;
  return (
    <section className="surface-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Case Lifecycle</h3>
          <p className="text-xs text-muted-foreground">
            Stage {idx + 1} of {LIFECYCLE.length} · {current}
          </p>
        </div>
        <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
          {Math.round(pct)}% complete
        </Badge>
      </div>
      <Progress value={pct} className="mb-4 h-1.5" />
      <ScrollArea>
        <ol className="flex min-w-max items-start gap-1">
          {LIFECYCLE.map((stage, i) => {
            const done = i < idx;
            const active = i === idx;
            return (
              <li key={stage} className="flex items-start">
                <div className="flex w-[110px] flex-col items-center text-center">
                  <div
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full border text-[11px] font-semibold transition",
                      done && "border-primary bg-primary text-primary-foreground",
                      active &&
                        "border-primary bg-primary/10 text-primary ring-4 ring-primary/15",
                      !done && !active && "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "mt-1.5 line-clamp-2 px-1 text-[10px] leading-tight",
                      active ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {stage}
                  </span>
                </div>
                {i < LIFECYCLE.length - 1 && (
                  <div
                    className={cn(
                      "mt-3.5 h-[2px] w-4 shrink-0 rounded-full",
                      i < idx ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </ScrollArea>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// Left panel — Case summary
// ────────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <aside className="space-y-4">
      <section className="surface-card p-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border border-border">
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {CASE.patientName
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-display text-base font-semibold leading-tight text-foreground">
              {CASE.patientName}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {CASE.gender} · {CASE.age} yrs
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{countryFlag(CASE.country)}</span>
              <span>
                {CASE.country} · {CASE.language}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5">
          <IconAction icon={Phone} label="Call" />
          <IconAction icon={MessageCircle} label="WhatsApp" tone="whatsapp" />
          <IconAction icon={Mail} label="Email" />
          <IconAction icon={Share2} label="Share" />
        </div>

        <Separator className="my-4" />

        <dl className="space-y-2.5 text-xs">
          <Field label="Case ID" value={CASE.caseId} mono />
          <Field label="Lead ID" value={CASE.leadId} mono />
          <Field label="Nationality" value={CASE.nationality} />
          <Field label="Passport" value={CASE.passport} mono />
          <Field label="Phone" value={CASE.phone} />
          <Field label="WhatsApp" value={CASE.whatsapp} />
          <Field label="Email" value={CASE.email} />
        </dl>

        <Separator className="my-4" />

        <dl className="space-y-2.5 text-xs">
          <Field label="Lead Source" value={CASE.leadSource} />
          <Field
            label="Case Type"
            value={
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                {CASE.caseType}
              </Badge>
            }
          />
          <Field label="Disease" value={CASE.disease} />
          <Field
            label="Urgency"
            value={
              <Badge className="bg-warning/15 text-warning hover:bg-warning/20">
                {CASE.urgency}
              </Badge>
            }
          />
          <Field
            label="Coordinator"
            value={
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-secondary/15 text-[9px] font-semibold text-secondary">
                    {CASE.coordinator.initials}
                  </AvatarFallback>
                </Avatar>
                <span>{CASE.coordinator.name}</span>
              </div>
            }
          />
          <Field label="Stage" value={CASE.currentStage} />
          <Field label="Status" value={CASE.currentStatus} />
          <Field label="Created" value={CASE.createdDate} />
          <Field label="Updated" value={CASE.lastUpdated} />
        </dl>

        <Separator className="my-4" />

        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Case Health
            </span>
            <Heart className="h-3.5 w-3.5 text-warning" />
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
            <span className="text-sm font-semibold text-warning">{CASE.healthScore}</span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            AI health score arrives with the AI Module.
          </p>
        </div>
      </section>
    </aside>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 flex-1 text-right text-foreground",
          mono && "font-numeric text-[11px]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function IconAction({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof Phone;
  label: string;
  tone?: "whatsapp";
}) {
  return (
    <button
      title={label}
      aria-label={label}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-1 py-2 text-[10px] text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
        tone === "whatsapp" && "hover:border-success/40 hover:bg-success/10 hover:text-success",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// Right panel
// ────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: Phone, label: "Call Patient" },
  { icon: MessageCircle, label: "WhatsApp Patient" },
  { icon: Mail, label: "Email Patient" },
  { icon: Upload, label: "Request Reports" },
  { icon: Paperclip, label: "Upload Reports" },
  { icon: UserPlus, label: "Assign Coordinator" },
  { icon: ClipboardList, label: "Create Task" },
  { icon: MessageSquareQuote, label: "Request Hospital Opinion" },
  { icon: FileText, label: "Generate Proposal" },
  { icon: CalendarClock, label: "Schedule Follow-up" },
  { icon: CheckCircle2, label: "Convert to Active Case", tone: "primary" as const },
  { icon: XCircle, label: "Close Case", tone: "danger" as const },
];

const AI_WIDGETS = [
  "AI Case Summary",
  "Medical Summary",
  "Missing Reports",
  "Suggested Hospitals",
  "Suggested Doctors",
  "Urgency Analysis",
  "Risk Analysis",
  "Translation",
  "Quotation Analysis",
  "Next Best Action",
  "Conversion Probability",
  "Opportunity Score",
];

function RightPanel() {
  return (
    <aside className="space-y-4">
      <Widget title="Quick Actions" description="Everything without leaving the case">
        <div className="grid grid-cols-1 gap-1.5">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-left text-xs font-medium text-foreground transition hover:border-primary/30 hover:bg-primary/5",
                a.tone === "primary" &&
                  "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10",
                a.tone === "danger" &&
                  "border-destructive/30 text-destructive hover:bg-destructive/5",
              )}
            >
              <a.icon className="h-3.5 w-3.5" />
              <span className="truncate">{a.label}</span>
            </button>
          ))}
        </div>
      </Widget>

      <Widget title="Alerts" description="Live case signals">
        <ul className="space-y-2 text-xs">
          <AlertRow tone="warning" text="Passport copy missing" />
          <AlertRow tone="warning" text="Patient decision pending 3 days" />
          <AlertRow tone="info" text="Quotation valid until 15 Jul 2026" />
        </ul>
      </Widget>

      <Widget
        title="AI Assistants"
        description="Available in AI Module"
        actions={<Sparkles className="h-4 w-4 text-accent" />}
      >
        <div className="grid grid-cols-2 gap-1.5">
          {AI_WIDGETS.map((w) => (
            <div
              key={w}
              className="rounded-md border border-dashed border-border bg-muted/40 p-2 text-[10px] leading-tight text-muted-foreground"
            >
              {w}
            </div>
          ))}
        </div>
      </Widget>
    </aside>
  );
}

function AlertRow({ tone, text }: { tone: "warning" | "info" | "danger"; text: string }) {
  const toneCls =
    tone === "warning"
      ? "text-warning bg-warning/5 border-warning/20"
      : tone === "danger"
        ? "text-destructive bg-destructive/5 border-destructive/20"
        : "text-info bg-info/5 border-info/20";
  return (
    <li className={cn("flex items-start gap-2 rounded-md border px-2.5 py-1.5", toneCls)}>
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="text-foreground">{text}</span>
    </li>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab helpers
// ────────────────────────────────────────────────────────────────

function WorkspaceTab({
  value,
  icon: Icon,
  label,
  locked,
}: {
  value: string;
  icon: typeof LayoutGrid;
  label: string;
  locked?: boolean;
}) {
  return (
    <TabsTrigger
      value={value}
      disabled={locked}
      className={cn(
        "gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none",
        locked && "opacity-60",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {locked && <Lock className="ml-0.5 h-3 w-3" />}
    </TabsTrigger>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Overview
// ────────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Widget title="Case Summary">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <SumField label="Coordinator" value={CASE.coordinator.name} />
          <SumField label="Current Stage" value={CASE.currentStage} />
          <SumField label="Hospital" value={CASE.hospital} />
          <SumField label="Doctor" value={CASE.doctor} />
          <SumField label="Case Type" value={CASE.caseType} />
          <SumField label="Urgency" value={CASE.urgency} />
        </dl>
        <Separator className="my-4" />
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-primary">
            Next Action
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">
            Follow up with patient on Aster Medcity quotation
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">Due today · 4:00 PM</div>
        </div>
      </Widget>

      <Widget title="Important Alerts">
        <ul className="space-y-2 text-xs">
          <AlertRow tone="warning" text="Missing: Passport copy, Latest ECG" />
          <AlertRow tone="warning" text="Quotation response pending 3 days" />
          <AlertRow tone="info" text="Second opinion request open with Aster Medcity" />
        </ul>
      </Widget>

      <Widget title="Outstanding Tasks">
        <ul className="divide-y divide-border text-xs">
          {[
            { t: "Send translated quotation to family", who: "Fatima R.", due: "Today" },
            { t: "Confirm surgeon preference with patient", who: "Fatima R.", due: "Tomorrow" },
            { t: "Collect passport & visa docs", who: "Anitha V.", due: "3 Jul" },
          ].map((t) => (
            <li key={t.t} className="flex items-center justify-between gap-3 py-2">
              <span className="text-foreground">{t.t}</span>
              <span className="text-[11px] text-muted-foreground">
                {t.who} · {t.due}
              </span>
            </li>
          ))}
        </ul>
      </Widget>

      <Widget title="Missing Reports">
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {[
            { r: "MRI", ok: true },
            { r: "CT", ok: true },
            { r: "Blood", ok: true },
            { r: "ECG", ok: false },
            { r: "Passport", ok: false },
            { r: "Prescription", ok: true },
          ].map((r) => (
            <Badge
              key={r.r}
              variant="outline"
              className={cn(
                "border",
                r.ok
                  ? "border-success/30 bg-success/5 text-success"
                  : "border-destructive/30 bg-destructive/5 text-destructive",
              )}
            >
              {r.r} {r.ok ? "✓" : "✕"}
            </Badge>
          ))}
        </div>
      </Widget>
    </div>
  );
}

function SumField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Medical Reports
// ────────────────────────────────────────────────────────────────

const REPORTS = [
  { name: "Cardiac MRI — 12 Jun 2026", type: "MRI", by: "Muscat Diagnostics", size: "24 MB", icon: FileImage },
  { name: "Coronary CT Angio — 15 Jun 2026", type: "CT", by: "Muscat Diagnostics", size: "48 MB", icon: FileImage },
  { name: "Blood Panel — 16 Jun 2026", type: "Blood", by: "Al-Nahda Lab", size: "310 KB", icon: FileText },
  { name: "ECG Recording", type: "ECG", by: "Patient upload", size: "1.2 MB", icon: Activity },
  { name: "Surgeon consult (voice)", type: "Voice", by: "Fatima R.", size: "6 MB", icon: Mic },
  { name: "Angiogram clip", type: "Video", by: "Muscat Diagnostics", size: "112 MB", icon: FileVideo },
];

function MedicalTab() {
  return (
    <div className="space-y-4">
      <Widget
        title="Medical Reports"
        description="Every report ever received — with version history"
        actions={
          <Button size="sm" variant="outline">
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
          </Button>
        }
      >
        <ul className="divide-y divide-border">
          {REPORTS.map((r) => (
            <li key={r.name} className="flex items-center gap-3 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-muted-foreground">
                <r.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{r.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {r.type} · {r.by} · {r.size}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <History className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Widget>

      <AIPlaceholderBanner text="AI Medical Analysis · Missing Reports Detection · Risk Analysis will populate here in the AI Module." />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Communication
// ────────────────────────────────────────────────────────────────

const COMMS = [
  { channel: "WhatsApp", when: "Today · 09:12", by: "Fatima R.", summary: "Sent Aster Medcity quotation in Arabic. Awaiting decision." },
  { channel: "Call", when: "Yesterday · 17:40", by: "Fatima R.", summary: "Discussed surgeon preferences with son. Length: 12 min." },
  { channel: "Email", when: "28 Jun · 14:02", by: "Anitha V.", summary: "Received opinion from Aster cardio team + attachments." },
  { channel: "WhatsApp", when: "20 Jun · 11:15", by: "Patient", summary: "Sent MRI scan images (4 files)." },
  { channel: "Internal", when: "18 Jun · 10:33", by: "Dr. Menon", summary: "Reviewed reports. Recommends CABG." },
];

function CommunicationTab() {
  return (
    <Widget
      title="Unified Communication"
      description="WhatsApp · Calls · Emails · SMS · Voice · Internal · Hospital"
      actions={
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Log message
        </Button>
      }
    >
      <ul className="divide-y divide-border">
        {COMMS.map((c, i) => (
          <li key={i} className="flex items-start gap-3 py-3">
            <Badge variant="outline" className="border-border text-[10px]">
              {c.channel}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-foreground">{c.summary}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {c.by} · {c.when}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Widget>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Tasks
// ────────────────────────────────────────────────────────────────

const TASKS = [
  { t: "Send translated quotation", p: "High", who: "Fatima R.", due: "Today", s: "In progress" },
  { t: "Confirm surgeon preference", p: "High", who: "Fatima R.", due: "2 Jul", s: "Open" },
  { t: "Collect passport & visa docs", p: "Medium", who: "Anitha V.", due: "3 Jul", s: "Open" },
  { t: "Draft travel plan", p: "Medium", who: "Ravi K.", due: "5 Jul", s: "Blocked" },
  { t: "Book pre-op consult", p: "Low", who: "Fatima R.", due: "8 Jul", s: "Open" },
];

function TasksTab() {
  return (
    <Widget
      title="Tasks & Checklists"
      actions={
        <Button size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Task
        </Button>
      }
    >
      <ul className="divide-y divide-border">
        {TASKS.map((t) => (
          <li key={t.t} className="flex items-center gap-3 py-2.5 text-xs">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border-border" />
            <span className="flex-1 text-sm text-foreground">{t.t}</span>
            <Badge variant="outline" className="border-border text-[10px]">
              {t.p}
            </Badge>
            <span className="w-24 truncate text-[11px] text-muted-foreground">{t.who}</span>
            <span className="w-16 text-[11px] text-muted-foreground">{t.due}</span>
            <Badge variant="outline" className="border-border text-[10px]">
              {t.s}
            </Badge>
          </li>
        ))}
      </ul>
    </Widget>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Documents
// ────────────────────────────────────────────────────────────────

const DOCS = [
  "Passport",
  "Visa",
  "Insurance",
  "Quotation",
  "Invoices",
  "Medical Reports",
  "Travel Documents",
  "Consent Forms",
];

function DocumentsTab() {
  return (
    <Widget
      title="Document Repository"
      description="Everything searchable · one source of truth"
      actions={
        <Button size="sm" variant="outline">
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {DOCS.map((d) => (
          <div
            key={d}
            className="cursor-pointer rounded-lg border border-border bg-card p-3 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <FolderOpen className="h-5 w-5 text-primary" />
            <div className="mt-2 text-xs font-medium text-foreground">{d}</div>
            <div className="text-[10px] text-muted-foreground">
              {Math.floor(Math.random() * 6) + 1} files
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Notes
// ────────────────────────────────────────────────────────────────

const NOTES = [
  { cat: "Coordinator", when: "Today · 09:20", by: "Fatima R.", body: "Patient's son prefers Aster over Amrita — cost sensitivity mentioned." },
  { cat: "Medical", when: "18 Jun · 10:33", by: "Dr. Menon", body: "Triple-vessel disease. Recommend on-pump CABG." },
  { cat: "Travel", when: "22 Jun · 15:04", by: "Ravi K.", body: "Family of 3 will travel. Prefer direct Muscat–Kochi flight." },
  { cat: "Finance", when: "28 Jun · 12:10", by: "Nisha P.", body: "Quotation OMR 6,400. INR estimate ≈ ₹13.8L." },
];

function NotesTab() {
  return (
    <Widget
      title="Notes"
      actions={
        <Button size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Note
        </Button>
      }
    >
      <ul className="space-y-3">
        {NOTES.map((n, i) => (
          <li key={i} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Badge variant="outline" className="border-border text-[10px]">
                {n.cat}
              </Badge>
              <span>
                {n.by} · {n.when}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-foreground">{n.body}</p>
          </li>
        ))}
      </ul>
    </Widget>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Timeline
// ────────────────────────────────────────────────────────────────

const EVENTS = [
  { icon: UserPlus, when: "12 Jun · 08:04", title: "Lead Created", by: "WhatsApp inbound" },
  { icon: MessageCircle, when: "12 Jun · 09:10", title: "WhatsApp Received", by: "Patient" },
  { icon: Upload, when: "15 Jun · 14:22", title: "MRI Uploaded", by: "Patient" },
  { icon: MessageSquareQuote, when: "20 Jun · 11:45", title: "Hospital Request Sent — Aster Medcity", by: "Fatima R." },
  { icon: FileText, when: "28 Jun · 14:02", title: "Hospital Opinion Received", by: "Aster Medcity" },
  { icon: Wallet, when: "28 Jun · 15:30", title: "Quotation Generated", by: "System" },
  { icon: MessageCircle, when: "2 Jul · 09:12", title: "Follow-up sent to patient", by: "Fatima R." },
];

function TimelineTab() {
  return (
    <Widget title="Case Timeline" description="Chronological · never deleted">
      <ol className="relative space-y-4 border-l border-border pl-5">
        {EVENTS.map((e, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[27px] grid h-5 w-5 place-items-center rounded-full border border-border bg-background text-primary">
              <e.icon className="h-3 w-3" />
            </span>
            <div className="text-sm font-medium text-foreground">{e.title}</div>
            <div className="text-[11px] text-muted-foreground">
              {e.when} · {e.by}
            </div>
          </li>
        ))}
      </ol>
    </Widget>
  );
}

// ────────────────────────────────────────────────────────────────
// Locked module + AI banner
// ────────────────────────────────────────────────────────────────

function LockedModule() {
  return (
    <div className="surface-card grid place-items-center p-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Lock className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-foreground">
        Module locked
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        This module unlocks automatically when the case reaches the required stage.
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" />
        <span>Case must be activated to unlock Hospital Opinions, Proposal, Travel, Treatment, Finance & Follow-up.</span>
      </div>
    </div>
  );
}

function AIPlaceholderBanner({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4">
      <Sparkles className="mt-0.5 h-4 w-4 text-accent" />
      <div>
        <div className="text-xs font-semibold text-foreground">AI Assistants</div>
        <p className="text-[11px] text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
