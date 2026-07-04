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
  HeartPulse,
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
  Clock,
  Hourglass,
  UserCircle2,
  ArrowRight,
  Wallet as WalletIcon,
  Flag,
  Gauge,
  Percent,
  Timer,
  TrendingUp,
  Voicemail,
  PhoneCall,
  Radar,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  WorkflowSummaryPanel,
  WorkflowEngineView,
  useDemoWorkflowState,
} from "@/components/workflow/WorkflowEngine";
import type { WorkflowState } from "@/lib/workflow";

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
  priority: "High" as "Critical" | "High" | "Medium" | "Low",
  nextBestAction: {
    icon: "phone" as "phone" | "message" | "upload" | "file" | "plane" | "calendar" | "stethoscope",
    label: "Follow up patient today",
    detail: "WhatsApp Aster Medcity quotation follow-up to family",
    due: "Today · 4:00 PM",
    priority: "High" as "Critical" | "High" | "Medium" | "Low",
  },
  latestQuotation: {
    hospital: "Aster Medcity",
    approvedAt: "28 Jun 2026",
    validUntil: "15 Jul 2026",
    originalCurrency: "AED" as const,
    originalAmount: 82_500,
    exchangeRate: 22.5,
    convertedInr: 1_856_250,
  },
  revenueBreakdown: {
    riayahServiceChargeInr: 250_000,
    expectedHospitalCommissionInr: 185_625,
    expectedReferralCommissionInr: 50_000,
    otherRevenueInr: 0,
    expectedNetRevenueInr: 485_625,
  },
  lastContact: {
    channel: "WhatsApp",
    at: "Today · 09:14",
  },
  waitingSinceDays: 3,
  healthScoreDetail: {
    overall: 68,
    status: "Attention" as "Healthy" | "Attention" | "Critical",
    categories: [
      {
        key: "medical",
        label: "Medical",
        score: 75,
        items: [
          { ok: true, text: "MRI Uploaded" },
          { ok: true, text: "CT Uploaded" },
          { ok: false, text: "Blood Report Missing" },
        ],
      },
      {
        key: "communication",
        label: "Communication",
        score: 55,
        items: [
          { ok: true, text: "WhatsApp yesterday" },
          { ok: false, text: "Follow-up overdue" },
        ],
      },
      {
        key: "operations",
        label: "Operations",
        score: 65,
        items: [
          { ok: true, text: "Hospital opinion received" },
          { ok: false, text: "Waiting 5 days" },
        ],
      },
      {
        key: "documents",
        label: "Documents",
        score: 70,
        items: [
          { ok: true, text: "Passport" },
          { ok: true, text: "Quotation" },
          { ok: false, text: "Visa pending" },
        ],
      },
      {
        key: "finance",
        label: "Finance",
        score: 72,
        items: [
          { ok: true, text: "Revenue calculated" },
          { ok: false, text: "Payment pending" },
        ],
      },
    ],
  },
  revenueProbability: {
    probability: 87,
    stage: "Hospital Opinion Received",
    reason: "Patient engaged · quotation shared · awaiting decision",
    expectedDecision: "5 Jul 2026",
    expectedArrival: "18 Jul 2026",
  },
  communicationSummary: {
    lastWhatsapp: "Today · 09:14",
    lastCall: "1 Jul · 11:20",
    lastEmail: "29 Jun · 16:02",
    voiceNotes: 3,
    unread: 2,
    lastInternalNote: "Today · 08:41 · Fatima R.",
    lastHospitalUpdate: "Yesterday · 14:22 · Aster",
  },
  sla: [
    { label: "Hospital Opinion", status: "Met", remaining: "Completed", tone: "green" as const },
    { label: "Quotation", status: "On Track", remaining: "1d left", tone: "green" as const },
    { label: "Patient Decision", status: "At Risk", remaining: "6h left", tone: "yellow" as const },
    { label: "Visa", status: "Overdue", remaining: "-1d", tone: "red" as const },
    { label: "Travel", status: "Pending", remaining: "7d", tone: "green" as const },
    { label: "Follow-up", status: "Scheduled", remaining: "14d", tone: "green" as const },
  ],
  financialSnapshot: {
    hospitalBillInr: 1_856_250,
    expensesInr: 80_000,
    expectedProfitInr: 405_625,
    outstandingInr: 1_856_250,
    paymentStatus: "Not Started" as
      | "Not Started"
      | "Partial"
      | "Paid"
      | "Refunded",
    collectionStatus: "Pending" as "Pending" | "In Progress" | "Complete",
  },
  forecast: {
    d30: { revenue: 485_625, collections: 250_000, expenses: 80_000, profit: 155_625 },
    d60: { revenue: 850_000, collections: 600_000, expenses: 150_000, profit: 300_000 },
    d90: { revenue: 1_200_000, collections: 950_000, expenses: 220_000, profit: 530_000 },
    confidence: 72,
  },
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

const INITIAL_WORKFLOW: WorkflowState = {
  pathId: "surgery",
  currentStageId: "hospital_opinion_received",
  progress: {
    hospital_opinion_received: {
      stageId: "hospital_opinion_received",
      status: "in_progress",
      entryDate: new Date(Date.now() - 6 * 3600_000).toISOString(),
      assignedCoordinator: "Fatima Rahman",
      uploadedDocuments: ["Hospital Opinion"],
      completedTasks: ["Translate opinion to patient language"],
      waitingHours: 6,
    },
  },
};

function CaseWorkspace() {
  const [tab, setTab] = useState("overview");
  const workflow = useDemoWorkflowState(INITIAL_WORKFLOW);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Case Workspace"
        title={CASE.patientName}
        subtitle="Single source of truth · every department works from this record. Tabs unlock automatically as the case progresses."
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

      <ExecutiveStatusBanner onNavigate={setTab} />

      <ExecutiveIntelligence onNavigate={setTab} />

      <LifecycleTracker current={CASE.currentStage} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <LeftPanel />

        <div className="min-w-0">
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <div className="surface-card p-1.5">
              <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                <WorkspaceTab value="overview" icon={LayoutGrid} label="Overview" />
                <WorkspaceTab value="workflow" icon={Radar} label="Workflow" />
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
// Executive Case Status Banner
// ────────────────────────────────────────────────────────────────

const PRIORITY_TONE: Record<
  "Critical" | "High" | "Medium" | "Low",
  { dot: string; badge: string }
> = {
  Critical: { dot: "bg-destructive", badge: "bg-destructive/15 text-destructive" },
  High: { dot: "bg-warning", badge: "bg-warning/15 text-warning" },
  Medium: { dot: "bg-info", badge: "bg-info/15 text-info" },
  Low: { dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground" },
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const originalCurrencyFormatter = (code: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  });

interface BannerKpiProps {
  icon: typeof Phone;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  onClick?: () => void;
  accent?: boolean;
  className?: string;
}

function BannerKpi({
  icon: Icon,
  label,
  value,
  hint,
  onClick,
  accent,
  className,
}: BannerKpiProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-w-0 flex-col items-start gap-1 rounded-xl border border-border/70 bg-card/60 p-3 text-left transition hover:-translate-y-0.5 hover:border-success/40 hover:bg-success/5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40",
        accent && "border-success/40 bg-success/5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-success" />
        {label}
      </div>
      <div className="min-w-0 text-sm font-semibold leading-tight text-foreground">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </button>
  );
}

function ExecutiveStatusBanner({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const priorityTone = PRIORITY_TONE[CASE.priority];
  const q = CASE.latestQuotation;
  const rb = CASE.revenueBreakdown;
  const originalFormatted = originalCurrencyFormatter(q.originalCurrency).format(q.originalAmount);

  return (
    <section className="sticky top-2 z-30">
      <div className="surface-card border-success/25 bg-gradient-to-br from-success/[0.06] via-card to-card p-4 shadow-[var(--shadow-elegant)] backdrop-blur">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 animate-pulse rounded-full", priorityTone.dot)} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-success">
              Executive Case Status
            </span>
            <Badge
              variant="outline"
              className="border-border/70 bg-background/60 text-[10px] font-medium text-muted-foreground"
            >
              Live · {CASE.lastUpdated}
            </Badge>
          </div>
          <Badge className={cn("gap-1 border-0", priorityTone.badge)}>
            <Flag className="h-3 w-3" />
            {CASE.priority} Priority
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-12">
          <BannerKpi
            icon={Activity}
            label="Case Status"
            value={CASE.currentStatus}
            hint="Current disposition"
            onClick={() => onNavigate("overview")}
          />
          <BannerKpi
            icon={LayoutGrid}
            label="Workflow Stage"
            value={CASE.currentStage}
            hint={`Stage ${LIFECYCLE.indexOf(CASE.currentStage) + 1} of ${LIFECYCLE.length}`}
            onClick={() => onNavigate("timeline")}
          />
          <BannerKpi
            icon={ArrowRight}
            label="Next Best Action"
            value={CASE.nextBestAction.label}
            hint={CASE.nextBestAction.due}
            onClick={() => onNavigate("tasks")}
            accent
          />

          {/* Structured Expected Revenue — spans 3 cols on xl */}
          <button
            type="button"
            onClick={() => onNavigate("finance")}
            className="col-span-2 xl:col-span-3 flex flex-col gap-2 rounded-xl border border-success/40 bg-success/[0.06] p-3 text-left transition hover:-translate-y-0.5 hover:border-success/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <WalletIcon className="h-3.5 w-3.5 text-success" />
                Expected Revenue
              </div>
              <Badge
                variant="outline"
                className="border-success/30 bg-success/10 text-[9px] font-semibold text-success"
              >
                Latest Quotation · {q.approvedAt}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              <MiniStat label="Currency" value={q.originalCurrency} />
              <MiniStat label="Original" value={originalFormatted} />
              <MiniStat label="FX Rate" value={q.exchangeRate.toFixed(2)} />
              <MiniStat label="INR" value={inrFormatter.format(q.convertedInr)} strong />
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              <MiniStat label="Riayah Fee" value={inrFormatter.format(rb.riayahServiceChargeInr)} />
              <MiniStat
                label="Hosp. Comm."
                value={inrFormatter.format(rb.expectedHospitalCommissionInr)}
              />
              <MiniStat
                label="Referral"
                value={inrFormatter.format(rb.expectedReferralCommissionInr)}
              />
              <MiniStat label="Other" value={inrFormatter.format(rb.otherRevenueInr)} />
            </div>
            <div className="flex items-center justify-between rounded-md bg-success/10 px-2 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-success">
                Expected Net Revenue
              </span>
              <span className="font-numeric text-sm font-bold text-success">
                {inrFormatter.format(rb.expectedNetRevenueInr)}
              </span>
            </div>
          </button>

          <BannerKpi
            icon={MessageCircle}
            label="Last Contact"
            value={CASE.lastContact.at}
            hint={`via ${CASE.lastContact.channel}`}
            onClick={() => onNavigate("communication")}
          />
          <BannerKpi
            icon={Hourglass}
            label="Waiting Since"
            value={`${CASE.waitingSinceDays} days`}
            hint="In current stage"
            onClick={() => onNavigate("timeline")}
          />
          <BannerKpi
            icon={UserCircle2}
            label="Coordinator"
            value={
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-secondary/15 text-[9px] font-semibold text-secondary">
                    {CASE.coordinator.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{CASE.coordinator.name}</span>
              </div>
            }
            hint="Assigned owner"
          />
          <BannerKpi
            icon={Building2}
            label="Hospital"
            value={CASE.hospital}
            hint="Handling facility"
            onClick={() => onNavigate("hospital-opinions")}
          />
          <BannerKpi
            icon={Stethoscope}
            label="Doctor"
            value={CASE.doctor.split(" · ")[0]}
            hint={CASE.doctor.split(" · ")[1] ?? "Consulting"}
            onClick={() => onNavigate("hospital-opinions")}
          />
          <BannerKpi
            icon={Clock}
            label="Case Age"
            value={CASE.createdDate}
            hint="Opened"
            onClick={() => onNavigate("timeline")}
          />
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-md bg-background/60 px-1.5 py-1">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "truncate font-numeric text-[11px] leading-tight text-foreground",
          strong && "font-semibold text-success",
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Executive Intelligence Grid
// ────────────────────────────────────────────────────────────────

const HEALTH_TONE: Record<
  "Healthy" | "Attention" | "Critical",
  { dot: string; text: string; bg: string; ring: string; label: string }
> = {
  Healthy: {
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success/10",
    ring: "ring-success/25",
    label: "Healthy",
  },
  Attention: {
    dot: "bg-warning",
    text: "text-warning",
    bg: "bg-warning/10",
    ring: "ring-warning/25",
    label: "Attention Required",
  },
  Critical: {
    dot: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    ring: "ring-destructive/25",
    label: "Critical",
  },
};

const SLA_TONE: Record<"green" | "yellow" | "red", string> = {
  green: "bg-success/10 text-success border-success/25",
  yellow: "bg-warning/10 text-warning border-warning/25",
  red: "bg-destructive/10 text-destructive border-destructive/25",
};

function ExecutiveIntelligence({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [healthOpen, setHealthOpen] = useState(false);
  const hs = CASE.healthScoreDetail;
  const tone = HEALTH_TONE[hs.status];
  const rp = CASE.revenueProbability;
  const cs = CASE.communicationSummary;
  const fs = CASE.financialSnapshot;
  const q = CASE.latestQuotation;
  const rb = CASE.revenueBreakdown;
  const fc = CASE.forecast;
  const nba = CASE.nextBestAction;

  const NbaIcon =
    nba.icon === "phone"
      ? Phone
      : nba.icon === "message"
        ? MessageCircle
        : nba.icon === "upload"
          ? Upload
          : nba.icon === "file"
            ? FileText
            : nba.icon === "plane"
              ? Plane
              : nba.icon === "stethoscope"
                ? Stethoscope
                : CalendarClock;

  return (
    <>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Case Health Score */}
        <button
          type="button"
          onClick={() => setHealthOpen(true)}
          className="surface-card group flex flex-col gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className={cn("h-4 w-4", tone.text)} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Case Health Score
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
          </div>
          <div className="flex items-end gap-3">
            <div className={cn("rounded-xl px-3 py-2 ring-4", tone.bg, tone.ring)}>
              <div className="font-numeric text-3xl font-bold tracking-tight text-foreground">
                {hs.overall}
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                / 100
              </div>
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 animate-pulse rounded-full", tone.dot)} />
                <span className={cn("text-sm font-semibold", tone.text)}>{tone.label}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Click for full breakdown by category.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {hs.categories.map((c) => (
              <div key={c.key} className="min-w-0">
                <div className="mb-1 truncate text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </div>
                <Progress value={c.score} className="h-1" />
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="font-numeric text-foreground">{c.score}%</span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      c.score >= 75 ? "bg-success" : c.score >= 55 ? "bg-warning" : "bg-destructive",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </button>

        {/* Revenue Probability */}
        <div className="surface-card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Revenue Probability
              </span>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-[10px] text-primary">
              <Percent className="mr-1 h-3 w-3" /> Live
            </Badge>
          </div>
          <div className="flex items-end gap-3">
            <div className="font-numeric text-3xl font-bold tracking-tight text-primary">
              {rp.probability}%
            </div>
            <div className="flex-1 pb-1">
              <Progress value={rp.probability} className="h-1.5" />
              <p className="mt-1.5 text-[11px] text-muted-foreground">{rp.reason}</p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-[10px]">
            <MiniStat label="Stage" value={rp.stage} />
            <MiniStat label="Decision" value={rp.expectedDecision} />
            <MiniStat label="Arrival" value={rp.expectedArrival} />
          </dl>
          <div className="grid grid-cols-3 gap-1.5 border-t border-dashed border-border pt-2 text-[10px]">
            <ForecastPill label="30d" />
            <ForecastPill label="60d" />
            <ForecastPill label="90d" />
          </div>
        </div>

        {/* Next Best Action */}
        <div className="surface-card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-accent" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Next Best Action
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-border/70 bg-background/60 text-[10px] text-muted-foreground"
            >
              Workflow rule
            </Badge>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
              <NbaIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{nba.label}</div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{nba.detail}</p>
              <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                <Badge className="border-0 bg-warning/15 text-warning">{nba.priority}</Badge>
                <span className="text-muted-foreground">{nba.due}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              Do it now
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate("tasks")}>
              View tasks
            </Button>
          </div>
        </div>

        {/* Communication Summary */}
        <button
          type="button"
          onClick={() => onNavigate("communication")}
          className="surface-card flex flex-col gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-info" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Communication Summary
              </span>
            </div>
            {cs.unread > 0 && (
              <Badge className="border-0 bg-destructive/15 text-[10px] text-destructive">
                {cs.unread} unread
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <CommRow icon={MessageCircle} label="WhatsApp" value={cs.lastWhatsapp} />
            <CommRow icon={PhoneCall} label="Call" value={cs.lastCall} />
            <CommRow icon={Mail} label="Email" value={cs.lastEmail} />
            <CommRow icon={Voicemail} label="Voice Notes" value={`${cs.voiceNotes} clips`} />
            <CommRow icon={StickyNote} label="Internal" value={cs.lastInternalNote} />
            <CommRow icon={Building2} label="Hospital" value={cs.lastHospitalUpdate} />
          </div>
        </button>

        {/* SLA Summary */}
        <div className="surface-card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                SLA Summary
              </span>
            </div>
            <Badge variant="outline" className="border-border/70 bg-background/60 text-[10px] text-muted-foreground">
              6 tracked
            </Badge>
          </div>
          <ul className="divide-y divide-border text-[11px]">
            {CASE.sla.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", HEALTH_TONE[
                    s.tone === "green" ? "Healthy" : s.tone === "yellow" ? "Attention" : "Critical"
                  ].dot)} />
                  <span className="text-foreground">{s.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">{s.remaining}</span>
                  <Badge variant="outline" className={cn("border text-[9px]", SLA_TONE[s.tone])}>
                    {s.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Financial Snapshot */}
        <div className="surface-card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4 text-success" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Financial Snapshot
              </span>
            </div>
            <Badge variant="outline" className="border-success/25 bg-success/5 text-[10px] text-success">
              INR reporting
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <MiniStat label="Currency" value={q.originalCurrency} />
            <MiniStat label="Original" value={originalCurrencyFormatter(q.originalCurrency).format(q.originalAmount)} />
            <MiniStat label="FX Rate" value={q.exchangeRate.toFixed(2)} />
            <MiniStat label="Converted INR" value={inrFormatter.format(q.convertedInr)} />
            <MiniStat label="Hospital Bill" value={inrFormatter.format(fs.hospitalBillInr)} />
            <MiniStat label="Riayah Fee" value={inrFormatter.format(rb.riayahServiceChargeInr)} />
            <MiniStat label="Hospital Comm." value={inrFormatter.format(rb.expectedHospitalCommissionInr)} />
            <MiniStat label="Referral Comm." value={inrFormatter.format(rb.expectedReferralCommissionInr)} />
            <MiniStat label="Other Revenue" value={inrFormatter.format(rb.otherRevenueInr)} />
            <MiniStat label="Expenses" value={inrFormatter.format(fs.expensesInr)} />
            <MiniStat label="Expected Profit" value={inrFormatter.format(fs.expectedProfitInr)} strong />
            <MiniStat label="Outstanding" value={inrFormatter.format(fs.outstandingInr)} />
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-border pt-2 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Payment</span>
              <Badge variant="outline" className="border-warning/25 bg-warning/5 text-warning">
                {fs.paymentStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Collection</span>
              <Badge variant="outline" className="border-info/25 bg-info/5 text-info">
                {fs.collectionStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Revenue Forecast — spans full width */}
        <div className="surface-card flex flex-col gap-3 p-4 xl:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Executive Revenue Forecast
              </span>
            </div>
            <Badge variant="outline" className="border-success/25 bg-success/5 text-[10px] text-success">
              <Timer className="mr-1 h-3 w-3" /> {fc.confidence}% confidence
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ForecastBlock label="Next 30 Days" data={fc.d30} tone="primary" />
            <ForecastBlock label="Next 60 Days" data={fc.d60} tone="info" />
            <ForecastBlock label="Next 90 Days" data={fc.d90} tone="success" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Later driven by latest hospital quotations, pipeline stage, revenue probability,
            historical conversion rates and active pipeline.
          </p>
        </div>
      </section>

      <CaseHealthSheet
        open={healthOpen}
        onOpenChange={setHealthOpen}
        detail={hs}
      />
    </>
  );
}

function CommRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MessageCircle;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-background/60 px-2 py-1.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
      <div className="min-w-0">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-[11px] text-foreground">{value}</div>
      </div>
    </div>
  );
}

function ForecastPill({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/40 px-1.5 py-1 text-center text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label} · forecast
    </div>
  );
}

function ForecastBlock({
  label,
  data,
  tone,
}: {
  label: string;
  data: { revenue: number; collections: number; expenses: number; profit: number };
  tone: "primary" | "info" | "success";
}) {
  const toneCls =
    tone === "primary"
      ? "border-primary/25 bg-primary/[0.05]"
      : tone === "info"
        ? "border-info/25 bg-info/[0.05]"
        : "border-success/25 bg-success/[0.05]";
  return (
    <div className={cn("rounded-xl border p-3", toneCls)}>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <dl className="space-y-1.5 text-[11px]">
        <ForecastRow label="Revenue" value={inrFormatter.format(data.revenue)} />
        <ForecastRow label="Collections" value={inrFormatter.format(data.collections)} />
        <ForecastRow label="Expenses" value={inrFormatter.format(data.expenses)} />
        <ForecastRow label="Profit" value={inrFormatter.format(data.profit)} strong />
      </dl>
    </div>
  );
}

function ForecastRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-numeric text-foreground", strong && "font-semibold text-success")}>
        {value}
      </dd>
    </div>
  );
}

function CaseHealthSheet({
  open,
  onOpenChange,
  detail,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  detail: typeof CASE.healthScoreDetail;
}) {
  const tone = HEALTH_TONE[detail.status];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HeartPulse className={cn("h-5 w-5", tone.text)} />
            Case Health Breakdown
          </SheetTitle>
          <SheetDescription>
            Why the case scores {detail.overall}/100 · {tone.label}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          {detail.categories.map((c) => (
            <section key={c.key} className="rounded-xl border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">{c.label}</div>
                <div className="flex items-center gap-2">
                  <Progress value={c.score} className="h-1.5 w-24" />
                  <span className="font-numeric text-xs text-muted-foreground">{c.score}%</span>
                </div>
              </div>
              <ul className="space-y-1 text-xs">
                {c.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {it.ok ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    ) : (
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                    )}
                    <span className={it.ok ? "text-foreground" : "text-destructive"}>{it.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
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
