import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  UserPlus,
  Upload,
  Download,
  Filter,
  Plus,
  Search,
  Phone,
  MessageCircle,
  FileText,
  ClipboardList,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BrainCircuit,
  AlertTriangle,
  Languages,
  Copy,
  ChevronRight,
  CalendarClock,
  MessageSquareQuote,
  MoreHorizontal,
  Mail,
  UserCheck,
  ArrowUpRight,
  Globe,
  Instagram,
  Handshake,
  Building2,
  DoorOpen,
  Keyboard,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Widget } from "@/components/common/Widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { countryFlag } from "@/lib/flags";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Lead Management — RiayahOS" },
      {
        name: "description",
        content:
          "Manage every patient enquiry from first contact to case conversion — GCC leads, pipeline stages, coordinators and follow-ups in one workspace.",
      },
    ],
  }),
  component: LeadManagement,
});

/* ---------------------------------------------------------------- */
/*  Types & tokens                                                  */
/* ---------------------------------------------------------------- */

type Priority = "Critical" | "High" | "Medium" | "Low";
type Tone = "primary" | "info" | "success" | "warning" | "danger" | "accent";

type Stage =
  | "New"
  | "Contacted"
  | "Reports Requested"
  | "Reports Received"
  | "Medical Review"
  | "Hospital Opinion Requested"
  | "Opinion Received"
  | "Proposal Generated"
  | "Patient Decision"
  | "Converted to Case"
  | "Closed";

type LeadSource =
  | "WhatsApp"
  | "Website"
  | "Meta Ads"
  | "Instagram"
  | "Referral Partner"
  | "Hospital Referral"
  | "Walk-In"
  | "Manual Entry";

type LeadType =
  | "Second Opinion"
  | "OP Consultation"
  | "Diagnostics"
  | "Day Care"
  | "Admission"
  | "Surgery"
  | "Follow-up";

type Status =
  | "New"
  | "Contacted"
  | "Waiting Reports"
  | "Medical Review"
  | "Hospital Opinion"
  | "Proposal"
  | "Converted"
  | "Lost";

const PRIORITY_STYLES: Record<Priority, string> = {
  Critical: "bg-destructive/10 text-destructive border-destructive/20",
  High: "bg-warning/10 text-warning border-warning/30",
  Medium: "bg-info/10 text-info border-info/20",
  Low: "bg-muted text-muted-foreground border-border",
};

function PriorityBadge({ level }: { level: Priority }) {
  return (
    <Badge
      variant="outline"
      className={cn("h-5 px-2 text-[11px] font-semibold", PRIORITY_STYLES[level])}
    >
      {level}
    </Badge>
  );
}

const STATUS_STYLES: Record<Status, string> = {
  New: "bg-info/10 text-info border-info/20",
  Contacted: "bg-primary/10 text-primary border-primary/20",
  "Waiting Reports": "bg-warning/10 text-warning border-warning/30",
  "Medical Review": "bg-secondary/15 text-secondary-foreground border-secondary/30",
  "Hospital Opinion": "bg-info/10 text-info border-info/20",
  Proposal: "bg-accent/15 text-accent-foreground border-accent/30",
  Converted: "bg-success/10 text-success border-success/20",
  Lost: "bg-muted text-muted-foreground border-border",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge
      variant="outline"
      className={cn("h-5 px-2 text-[11px] font-semibold", STATUS_STYLES[status])}
    >
      {status}
    </Badge>
  );
}

const SOURCE_ICON: Record<LeadSource, LucideIcon> = {
  WhatsApp: MessageCircle,
  Website: Globe,
  "Meta Ads": Sparkles,
  Instagram: Instagram,
  "Referral Partner": Handshake,
  "Hospital Referral": Building2,
  "Walk-In": DoorOpen,
  "Manual Entry": Keyboard,
};

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
}

/* ---------------------------------------------------------------- */
/*  Demo data (Supabase-ready shapes)                               */
/* ---------------------------------------------------------------- */

interface Lead {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  country: string;
  language: string;
  source: LeadSource;
  type: LeadType;
  disease: string;
  stage: Stage;
  status: Status;
  coordinator: { name: string; initials: string };
  priority: Priority;
  lastContact: string;
  nextFollowUp: string;
  createdAt: string;
  reportsCount: number;
  hospitalRequests: number;
  notes: string;
}

const COORDINATORS = ["Anjali R.", "Rahul M.", "Sneha P.", "Vikram S."] as const;

const LEADS: Lead[] = [
  {
    id: "LD-8241",
    name: "Ahmed Al-Mansoori",
    phone: "+971 50 812 4432",
    whatsapp: "+971 50 812 4432",
    country: "UAE",
    language: "Arabic",
    source: "WhatsApp",
    type: "Surgery",
    disease: "Cardiac Bypass",
    stage: "Proposal Generated",
    status: "Proposal",
    coordinator: { name: "Anjali R.", initials: "AR" },
    priority: "High",
    lastContact: "2h ago",
    nextFollowUp: "Today · 5:30 PM",
    createdAt: "3 days ago",
    reportsCount: 4,
    hospitalRequests: 2,
    notes: "Family requested comparison between Aster and Amrita quotes.",
  },
  {
    id: "LD-8240",
    name: "Fatima Al-Sayed",
    phone: "+966 55 221 9087",
    whatsapp: "+966 55 221 9087",
    country: "KSA",
    language: "Arabic",
    source: "Meta Ads",
    type: "Second Opinion",
    disease: "Breast Oncology",
    stage: "Hospital Opinion Requested",
    status: "Hospital Opinion",
    coordinator: { name: "Rahul M.", initials: "RM" },
    priority: "Critical",
    lastContact: "1d ago",
    nextFollowUp: "Today · 2:00 PM",
    createdAt: "5 days ago",
    reportsCount: 6,
    hospitalRequests: 3,
    notes: "Awaiting Dr. Suresh opinion. SLA breach — escalate today.",
  },
  {
    id: "LD-8239",
    name: "Yousef Al-Rashidi",
    phone: "+965 660 41 220",
    whatsapp: "+965 660 41 220",
    country: "Kuwait",
    language: "Arabic",
    source: "Referral Partner",
    type: "Surgery",
    disease: "Spine Fusion",
    stage: "Reports Received",
    status: "Medical Review",
    coordinator: { name: "Sneha P.", initials: "SP" },
    priority: "High",
    lastContact: "4h ago",
    nextFollowUp: "Tomorrow · 10:00 AM",
    createdAt: "2 days ago",
    reportsCount: 3,
    hospitalRequests: 0,
    notes: "MRI + X-ray uploaded. Ready for internal medical review.",
  },
  {
    id: "LD-8238",
    name: "Mariam Hassan",
    phone: "+968 9421 5560",
    whatsapp: "+968 9421 5560",
    country: "Oman",
    language: "Arabic",
    source: "Website",
    type: "OP Consultation",
    disease: "Neurology Consult",
    stage: "Contacted",
    status: "Contacted",
    coordinator: { name: "Anjali R.", initials: "AR" },
    priority: "Medium",
    lastContact: "6h ago",
    nextFollowUp: "Today · 7:00 PM",
    createdAt: "1 day ago",
    reportsCount: 0,
    hospitalRequests: 0,
    notes: "Prefers Aster Medcity. English secondary.",
  },
  {
    id: "LD-8237",
    name: "Khalid Al-Otaibi",
    phone: "+971 56 991 3382",
    whatsapp: "+971 56 991 3382",
    country: "UAE",
    language: "Arabic",
    source: "Hospital Referral",
    type: "Surgery",
    disease: "Liver Transplant",
    stage: "Opinion Received",
    status: "Hospital Opinion",
    coordinator: { name: "Rahul M.", initials: "RM" },
    priority: "Critical",
    lastContact: "30m ago",
    nextFollowUp: "Today · 4:15 PM",
    createdAt: "4 days ago",
    reportsCount: 8,
    hospitalRequests: 2,
    notes: "Donor evaluation pending. Family in Dubai.",
  },
  {
    id: "LD-8236",
    name: "Noura Al-Zahrani",
    phone: "+973 3311 8842",
    whatsapp: "+973 3311 8842",
    country: "Bahrain",
    language: "Arabic",
    source: "Instagram",
    type: "Diagnostics",
    disease: "Full Health Check",
    stage: "Reports Requested",
    status: "Waiting Reports",
    coordinator: { name: "Sneha P.", initials: "SP" },
    priority: "Low",
    lastContact: "1d ago",
    nextFollowUp: "Fri · 11:00 AM",
    createdAt: "6 days ago",
    reportsCount: 0,
    hospitalRequests: 0,
    notes: "Requested prior blood work reports.",
  },
  {
    id: "LD-8235",
    name: "Salem Al-Habsi",
    phone: "+968 9911 7720",
    whatsapp: "+968 9911 7720",
    country: "Oman",
    language: "Arabic",
    source: "WhatsApp",
    type: "Admission",
    disease: "Pediatric Cardiac",
    stage: "Converted to Case",
    status: "Converted",
    coordinator: { name: "Anjali R.", initials: "AR" },
    priority: "High",
    lastContact: "Today",
    nextFollowUp: "—",
    createdAt: "8 days ago",
    reportsCount: 5,
    hospitalRequests: 2,
    notes: "Converted to Case RY-2158. Admission scheduled.",
  },
  {
    id: "LD-8234",
    name: "Reem Al-Kaabi",
    phone: "+974 5544 2098",
    whatsapp: "+974 5544 2098",
    country: "Qatar",
    language: "Arabic",
    source: "Meta Ads",
    type: "Second Opinion",
    disease: "Fertility (IVF)",
    stage: "New",
    status: "New",
    coordinator: { name: "Vikram S.", initials: "VS" },
    priority: "Medium",
    lastContact: "—",
    nextFollowUp: "Today · 6:00 PM",
    createdAt: "45m ago",
    reportsCount: 0,
    hospitalRequests: 0,
    notes: "Landed via Meta ad campaign · Kerala IVF.",
  },
  {
    id: "LD-8233",
    name: "Hessa Al-Suwaidi",
    phone: "+971 52 704 1129",
    whatsapp: "+971 52 704 1129",
    country: "UAE",
    language: "Arabic",
    source: "Walk-In",
    type: "Follow-up",
    disease: "Post-op Ortho",
    stage: "Patient Decision",
    status: "Proposal",
    coordinator: { name: "Rahul M.", initials: "RM" },
    priority: "Medium",
    lastContact: "3h ago",
    nextFollowUp: "Tomorrow · 9:00 AM",
    createdAt: "9 days ago",
    reportsCount: 2,
    hospitalRequests: 1,
    notes: "Comparing two follow-up plans. Awaiting family decision.",
  },
  {
    id: "LD-8232",
    name: "Abdullah Al-Farsi",
    phone: "+968 9812 3311",
    whatsapp: "+968 9812 3311",
    country: "Oman",
    language: "Arabic",
    source: "Referral Partner",
    type: "Surgery",
    disease: "Bariatric",
    stage: "Closed",
    status: "Lost",
    coordinator: { name: "Vikram S.", initials: "VS" },
    priority: "Low",
    lastContact: "5d ago",
    nextFollowUp: "—",
    createdAt: "22 days ago",
    reportsCount: 1,
    hospitalRequests: 0,
    notes: "Chose local hospital. Marked as lost with reason.",
  },
];

/* ---------------------------------------------------------------- */
/*  Pipeline definition                                             */
/* ---------------------------------------------------------------- */

interface PipelineStage {
  key: Stage;
  color: string;
  dot: string;
}

const PIPELINE: PipelineStage[] = [
  { key: "New", color: "bg-info/10 text-info", dot: "bg-info" },
  { key: "Contacted", color: "bg-primary/10 text-primary", dot: "bg-primary" },
  { key: "Reports Requested", color: "bg-warning/10 text-warning", dot: "bg-warning" },
  { key: "Reports Received", color: "bg-warning/10 text-warning", dot: "bg-warning" },
  { key: "Medical Review", color: "bg-secondary/15 text-secondary-foreground", dot: "bg-secondary" },
  { key: "Hospital Opinion Requested", color: "bg-info/10 text-info", dot: "bg-info" },
  { key: "Opinion Received", color: "bg-info/10 text-info", dot: "bg-info" },
  { key: "Proposal Generated", color: "bg-accent/15 text-accent-foreground", dot: "bg-accent" },
  { key: "Patient Decision", color: "bg-accent/15 text-accent-foreground", dot: "bg-accent" },
  { key: "Converted to Case", color: "bg-success/10 text-success", dot: "bg-success" },
  { key: "Closed", color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/50" },
];

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */

function LeadManagement() {
  const [stageFilter, setStageFilter] = useState<Stage | "All">("All");
  const [country, setCountry] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [coordinator, setCoordinator] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<Lead | null>(null);

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of PIPELINE) map[s.key] = 0;
    for (const l of LEADS) map[l.stage] = (map[l.stage] ?? 0) + 1;
    return map;
  }, []);

  const maxStage = Math.max(...Object.values(stageCounts), 1);

  const filtered = useMemo(() => {
    return LEADS.filter((l) => {
      if (stageFilter !== "All" && l.stage !== stageFilter) return false;
      if (country !== "all" && l.country !== country) return false;
      if (language !== "all" && l.language !== language) return false;
      if (source !== "all" && l.source !== source) return false;
      if (coordinator !== "all" && l.coordinator.name !== coordinator) return false;
      if (priority !== "all" && l.priority !== priority) return false;
      if (status !== "all" && l.status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [
          l.name,
          l.id,
          l.phone,
          l.whatsapp,
          l.disease,
          l.country,
          l.coordinator.name,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [stageFilter, country, language, source, coordinator, priority, status, search]);

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const countries = Array.from(new Set(LEADS.map((l) => l.country)));
  const languages = Array.from(new Set(LEADS.map((l) => l.language)));
  const sources = Array.from(new Set(LEADS.map((l) => l.source)));

  return (
    <>
      <PageHeader
        eyebrow="Module · Lead Management"
        title="Lead Management"
        subtitle="Manage every enquiry from first contact to case conversion."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Advanced
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Lead
            </Button>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
        <StatCard label="New Leads Today" value="14" delta={{ value: "+22%", trend: "up" }} hint="last 24h" icon={UserPlus} tone="primary" />
        <StatCard label="Uncontacted Leads" value="9" delta={{ value: "+3", trend: "up" }} hint="awaiting first touch" icon={Clock} tone="warning" />
        <StatCard label="Reports Requested" value="21" delta={{ value: "+5", trend: "up" }} hint="documents pending" icon={FileText} tone="info" />
        <StatCard label="Reports Received" value="17" delta={{ value: "+8", trend: "up" }} hint="ready for review" icon={Upload} tone="info" />
        <StatCard label="Medical Review Pending" value="12" delta={{ value: "-2", trend: "down" }} hint="internal team" icon={ClipboardList} tone="accent" />
        <StatCard label="Hospital Opinions Requested" value="18" delta={{ value: "+4", trend: "up" }} hint="awaiting reply" icon={MessageSquareQuote} tone="info" />
        <StatCard label="Proposal Pending" value="8" delta={{ value: "-1", trend: "down" }} hint="quotations to send" icon={FileText} tone="accent" />
        <StatCard label="Converted Today" value="3" delta={{ value: "+1", trend: "up" }} hint="new cases opened" icon={CheckCircle2} tone="success" />
        <StatCard label="Lost Leads" value="5" delta={{ value: "-2", trend: "down" }} hint="last 7 days" icon={XCircle} tone="warning" />
      </div>

      {/* Pipeline */}
      <Widget
        className="mt-6"
        title="Lead Pipeline"
        description="Click any stage to filter the table below"
        actions={
          stageFilter !== "All" ? (
            <Button variant="ghost" size="sm" onClick={() => setStageFilter("All")}>
              Clear filter
            </Button>
          ) : null
        }
      >
        <ScrollArea>
          <div className="flex min-w-full items-stretch gap-2 pb-1">
            {PIPELINE.map((stage, idx) => {
              const count = stageCounts[stage.key] ?? 0;
              const pct = Math.round((count / maxStage) * 100);
              const active = stageFilter === stage.key;
              return (
                <button
                  key={stage.key}
                  onClick={() => setStageFilter(active ? "All" : stage.key)}
                  className={cn(
                    "surface-card group relative flex min-w-[160px] flex-1 flex-col justify-between p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)] focus:outline-none focus:ring-2 focus:ring-primary/40",
                    active && "ring-2 ring-primary/50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", stage.dot)} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="mt-2">
                    <div className="font-numeric text-2xl font-semibold text-foreground">
                      {count}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[11px] font-medium text-foreground/80">
                      {stage.key}
                    </div>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", stage.dot)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </Widget>

      {/* Sticky filters */}
      <div className="sticky top-16 z-20 -mx-4 mt-6 border-y border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, disease, coordinator, lead ID…"
              className="h-9 pl-8"
            />
          </div>
          <FilterSelect value={country} onChange={setCountry} placeholder="Country" options={countries} />
          <FilterSelect value={language} onChange={setLanguage} placeholder="Language" options={languages} />
          <FilterSelect value={source} onChange={setSource} placeholder="Source" options={sources} />
          <FilterSelect
            value={coordinator}
            onChange={setCoordinator}
            placeholder="Coordinator"
            options={[...COORDINATORS]}
          />
          <FilterSelect
            value={priority}
            onChange={setPriority}
            placeholder="Priority"
            options={["Critical", "High", "Medium", "Low"]}
          />
          <FilterSelect
            value={status}
            onChange={setStatus}
            placeholder="Status"
            options={[
              "New",
              "Contacted",
              "Waiting Reports",
              "Medical Review",
              "Hospital Opinion",
              "Proposal",
              "Converted",
              "Lost",
            ]}
          />
          <Button variant="outline" size="sm" className="h-9">
            <CalendarClock className="h-4 w-4" /> Date range
          </Button>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <span className="text-xs font-semibold text-primary">
              {selected.size} selected
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-7"><UserCheck className="h-3.5 w-3.5" /> Assign</Button>
              <Button size="sm" variant="outline" className="h-7"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</Button>
              <Button size="sm" variant="outline" className="h-7"><ArrowUpRight className="h-3.5 w-3.5" /> Change stage</Button>
              <Button size="sm" variant="outline" className="h-7"><Download className="h-3.5 w-3.5" /> Export</Button>
              <Button size="sm" variant="ghost" className="h-7 text-muted-foreground" onClick={() => setSelected(new Set())}>Clear</Button>
            </div>
          </div>
        )}
      </div>

      {/* Table + side widgets */}
      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        <Widget
          title="Leads"
          description={`${filtered.length} of ${LEADS.length} enquiries`}
          className="xl:col-span-3"
          contentClassName="p-0"
          actions={
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        >
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Lead ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Disease</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Coordinator</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => {
                    const SourceIcon = SOURCE_ICON[l.source];
                    return (
                      <TableRow
                        key={l.id}
                        className="cursor-pointer"
                        onClick={() => setPreview(l)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selected.has(l.id)}
                            onCheckedChange={() => toggleOne(l.id)}
                            aria-label={`Select ${l.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-numeric text-xs text-muted-foreground">
                          {l.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-muted text-xs font-medium">
                                {initials(l.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-foreground">{l.name}</div>
                              <div className="text-[11px] text-muted-foreground">{l.type}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <span aria-hidden className="text-base leading-none">
                              {countryFlag(l.country)}
                            </span>
                            {l.country}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{l.language}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <SourceIcon className="h-3.5 w-3.5" />
                            {l.source}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{l.disease}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="whitespace-nowrap font-normal">
                            {l.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                                {l.coordinator.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {l.coordinator.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell><PriorityBadge level={l.priority} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{l.lastContact}</TableCell>
                        <TableCell className="text-xs text-foreground">{l.nextFollowUp}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{l.createdAt}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                          <RowActions />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Widget>

        {/* Side widgets */}
        <div className="space-y-4">
          <Widget title="Recent Leads" description="Latest enquiries">
            <ul className="space-y-3">
              {LEADS.slice(0, 5).map((l) => {
                const SourceIcon = SOURCE_ICON[l.source];
                return (
                  <li
                    key={l.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/40"
                    onClick={() => setPreview(l)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {initials(l.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {l.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {l.createdAt}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span aria-hidden>{countryFlag(l.country)}</span>
                        <span>{l.disease}</span>
                        <span>·</span>
                        <SourceIcon className="h-3 w-3" />
                        <span>{l.source}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Widget>

          <Widget title="Today's Follow-ups" description="Scheduled outreach">
            <ul className="space-y-2.5">
              {LEADS.filter((l) => l.nextFollowUp.startsWith("Today"))
                .slice(0, 6)
                .map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 rounded-lg border border-border px-2.5 py-2"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {l.name}
                        </span>
                        <span className="shrink-0 font-numeric text-[11px] text-muted-foreground">
                          {l.nextFollowUp.replace("Today · ", "")}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">
                          {l.coordinator.name}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <PriorityBadge level={l.priority} />
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </Widget>

          <Widget
            title="AI Intelligence"
            description="Reserved for Module 2.6"
            actions={<Badge variant="outline" className="text-[10px]">Coming soon</Badge>}
          >
            <ul className="space-y-2">
              {[
                { icon: Sparkles, label: "Lead Summary" },
                { icon: AlertTriangle, label: "Urgency Detection" },
                { icon: Copy, label: "Duplicate Detection" },
                { icon: FileText, label: "Missing Reports" },
                { icon: BrainCircuit, label: "Recommended Next Action" },
                { icon: Languages, label: "Language Detection" },
              ].map((a) => (
                <li
                  key={a.label}
                  className="flex items-center gap-2.5 rounded-lg border border-dashed border-border px-2.5 py-2 text-xs text-muted-foreground"
                >
                  <a.icon className="h-3.5 w-3.5" />
                  <span>{a.label}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider">Reserved</span>
                </li>
              ))}
            </ul>
          </Widget>
        </div>
      </div>

      {/* Quick Preview drawer */}
      <Sheet open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {preview && <LeadPreview lead={preview} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ---------------------------------------------------------------- */
/*  Helpers                                                         */
/* ---------------------------------------------------------------- */

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[130px] gap-1.5">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder}s</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Lead actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem><ArrowUpRight className="h-4 w-4" /> Open lead</DropdownMenuItem>
        <DropdownMenuItem><Phone className="h-4 w-4" /> Call</DropdownMenuItem>
        <DropdownMenuItem><MessageCircle className="h-4 w-4" /> WhatsApp</DropdownMenuItem>
        <DropdownMenuItem><FileText className="h-4 w-4" /> Request reports</DropdownMenuItem>
        <DropdownMenuItem><UserCheck className="h-4 w-4" /> Assign coordinator</DropdownMenuItem>
        <DropdownMenuItem><ClipboardList className="h-4 w-4" /> Create task</DropdownMenuItem>
        <DropdownMenuItem><Sparkles className="h-4 w-4" /> Add note</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem><CheckCircle2 className="h-4 w-4" /> Convert to case</DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground">
          <XCircle className="h-4 w-4" /> Close lead
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <UserPlus className="h-5 w-5" />
      </div>
      <div>
        <div className="font-display text-base font-semibold text-foreground">
          No leads available.
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust filters or create a new enquiry to get started.
        </p>
      </div>
      <Button size="sm">
        <Plus className="h-4 w-4" /> Create New Lead
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  Preview drawer                                                  */
/* ---------------------------------------------------------------- */

function LeadPreview({ lead }: { lead: Lead }) {
  const SourceIcon = SOURCE_ICON[lead.source];
  return (
    <>
      <SheetHeader className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-numeric text-[11px] text-muted-foreground">{lead.id}</span>
          <StatusBadge status={lead.status} />
          <PriorityBadge level={lead.priority} />
        </div>
        <SheetTitle className="font-display text-xl">{lead.name}</SheetTitle>
        <SheetDescription className="flex items-center gap-1.5">
          <span aria-hidden>{countryFlag(lead.country)}</span>
          {lead.country} · {lead.disease}
        </SheetDescription>
      </SheetHeader>

      {/* Quick actions */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        <QuickAction icon={Phone} label="Call" />
        <QuickAction icon={MessageCircle} label="WhatsApp" />
        <QuickAction icon={Mail} label="Email" />
        <QuickAction icon={ArrowUpRight} label="Open" />
      </div>

      {/* Details */}
      <div className="mt-5 space-y-4">
        <PreviewSection title="Contact">
          <PreviewRow label="Phone" value={lead.phone} />
          <PreviewRow label="WhatsApp" value={lead.whatsapp} />
          <PreviewRow label="Language" value={lead.language} />
        </PreviewSection>

        <PreviewSection title="Enquiry">
          <PreviewRow
            label="Source"
            value={
              <span className="inline-flex items-center gap-1.5">
                <SourceIcon className="h-3.5 w-3.5" />
                {lead.source}
              </span>
            }
          />
          <PreviewRow label="Type" value={lead.type} />
          <PreviewRow label="Disease" value={lead.disease} />
          <PreviewRow label="Current Stage" value={lead.stage} />
        </PreviewSection>

        <PreviewSection title="Coordination">
          <PreviewRow label="Coordinator" value={lead.coordinator.name} />
          <PreviewRow label="Last Contact" value={lead.lastContact} />
          <PreviewRow label="Next Follow-up" value={lead.nextFollowUp} />
        </PreviewSection>

        <PreviewSection title="Medical">
          <PreviewRow label="Reports Uploaded" value={String(lead.reportsCount)} />
          <PreviewRow label="Hospital Requests" value={String(lead.hospitalRequests)} />
        </PreviewSection>

        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Notes
          </div>
          <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
            {lead.notes}
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
          Full Lead Workspace opens in Module 2.3. This is a quick preview.
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" size="sm"><Stethoscope className="h-4 w-4" /> Request reports</Button>
          <Button variant="outline" size="sm"><UserCheck className="h-4 w-4" /> Assign</Button>
          <Button variant="outline" size="sm"><ClipboardList className="h-4 w-4" /> Create task</Button>
          <Button size="sm"><CheckCircle2 className="h-4 w-4" /> Convert</Button>
        </div>
      </div>
    </>
  );
}

function QuickAction({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 py-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </button>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </div>
      <div className="divide-y divide-border rounded-lg border border-border">
        {children}
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
