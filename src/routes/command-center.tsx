import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import {
  PlaneLanding,
  CarFront,
  BedDouble,
  Stethoscope,
  ClipboardList,
  Scissors,
  LogOut,
  PlaneTakeoff,
  MessageSquareQuote,
  FileText,
  CalendarClock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  BrainCircuit,
  Users,
  Building2,
  Wallet,
  Receipt,
  Upload,
  Plane,
  Activity,
  Hotel,
  Languages,
  ChevronRight,
  ChevronDown,
  MapPin,
  BellRing,
  UserPlus,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Widget } from "@/components/common/Widget";
import { Timeline, type TimelineItem } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export const Route = createFileRoute("/command-center")({
  head: () => ({
    meta: [
      { title: "Executive Command Center — RiayahOS" },
      {
        name: "description",
        content:
          "Live operations control room for Riayah Care coordinators — arrivals, hospital opinions, travel, follow-ups and finance alerts in one screen.",
      },
    ],
  }),
  component: CommandCenter,
});

/* ------------------------------------------------------------------ */
/*  Shared types                                                      */
/* ------------------------------------------------------------------ */

type Priority = "Critical" | "High" | "Medium" | "Low";
type Tone = "primary" | "info" | "success" | "warning" | "danger" | "accent";

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

function StatusDot({ tone, label }: { tone: Tone | "muted"; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        tone === "success" && "text-success",
        tone === "warning" && "text-warning",
        tone === "info" && "text-info",
        tone === "danger" && "text-destructive",
        tone === "primary" && "text-primary",
        tone === "accent" && "text-accent-foreground",
        tone === "muted" && "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "success" && "bg-success",
          tone === "warning" && "bg-warning animate-pulse",
          tone === "info" && "bg-info",
          tone === "danger" && "bg-destructive animate-pulse",
          tone === "primary" && "bg-primary",
          tone === "accent" && "bg-accent",
          tone === "muted" && "bg-muted-foreground/50",
        )}
      />
      {label}
    </span>
  );
}

function Initials({ name }: { name: string }) {
  return (
    <>
      {name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Operational Stat Tile — compact, clickable                        */
/* ------------------------------------------------------------------ */

interface OpsTileProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone: Tone;
  status?: string;
  onClick?: () => void;
}

const TONE_ICON: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  accent: "bg-accent/15 text-accent-foreground",
};

const TONE_BADGE: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  info: "bg-info/10 text-info border-info/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  accent: "bg-accent/15 text-accent-foreground border-accent/30",
};

function OpsTile({ label, value, icon: Icon, tone, status, onClick }: OpsTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="surface-card group relative w-full overflow-hidden p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)] focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            TONE_ICON[tone],
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {status && (
          <Badge
            variant="outline"
            className={cn("h-5 px-1.5 text-[10px] font-semibold", TONE_BADGE[tone])}
          >
            {status}
          </Badge>
        )}
      </div>
      <div className="mt-3 font-numeric text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Data (static demo — Supabase-ready shapes)                         */
/* ------------------------------------------------------------------ */

const OPS_TILES: OpsTileProps[] = [
  { label: "Today's Arrivals", value: 6, icon: PlaneLanding, tone: "info", status: "Live" },
  { label: "Airport Pickups", value: 5, icon: CarFront, tone: "primary", status: "Scheduled" },
  { label: "Hotel Check-ins", value: 4, icon: BedDouble, tone: "accent" },
  { label: "OP Consultations", value: 11, icon: Stethoscope, tone: "info" },
  { label: "Admissions", value: 3, icon: ClipboardList, tone: "primary" },
  { label: "Surgeries", value: 2, icon: Scissors, tone: "warning", status: "Today" },
  { label: "Discharges", value: 4, icon: LogOut, tone: "success" },
  { label: "Return Flights", value: 3, icon: PlaneTakeoff, tone: "info" },
  { label: "Hospital Opinions Due", value: 9, icon: MessageSquareQuote, tone: "warning", status: "SLA" },
  { label: "Quotations Pending", value: 7, icon: FileText, tone: "accent" },
  { label: "Today's Follow-ups", value: 18, icon: CalendarClock, tone: "primary" },
  { label: "Critical Cases", value: 3, icon: AlertTriangle, tone: "danger", status: "Alert" },
];

interface UrgentCase {
  id: string;
  patient: string;
  country: string;
  disease: string;
  stage: string;
  reason: string;
  waiting: string;
  coordinator: string;
  nextAction: string;
  priority: Priority;
}

const URGENT_CASES: UrgentCase[] = [
  {
    id: "RY-2214",
    patient: "Fatima Al-Sayed",
    country: "KSA",
    disease: "Breast Oncology",
    stage: "Hospital Opinion",
    reason: "Opinion overdue — 3d",
    waiting: "3d 4h",
    coordinator: "Rahul M.",
    nextAction: "Escalate to Dr. Suresh",
    priority: "Critical",
  },
  {
    id: "RY-2201",
    patient: "Yousef Al-Rashidi",
    country: "Kuwait",
    disease: "Cardiac Bypass",
    stage: "Travel Planning",
    reason: "Missing passport scan",
    waiting: "1d 6h",
    coordinator: "Sneha P.",
    nextAction: "Request docs on WhatsApp",
    priority: "Critical",
  },
  {
    id: "RY-2189",
    patient: "Mariam Hassan",
    country: "Oman",
    disease: "Spine Fusion",
    stage: "Proposal Sent",
    reason: "Quotation not sent",
    waiting: "22h",
    coordinator: "Anjali R.",
    nextAction: "Generate proposal",
    priority: "High",
  },
  {
    id: "RY-2176",
    patient: "Khalid Al-Otaibi",
    country: "UAE",
    disease: "Liver Transplant",
    stage: "Travel Planning",
    reason: "Visa pending — arrival Tue",
    waiting: "18h",
    coordinator: "Rahul M.",
    nextAction: "Chase VFS Dubai",
    priority: "High",
  },
  {
    id: "RY-2162",
    patient: "Noura Al-Zahrani",
    country: "Bahrain",
    disease: "Neuro Consultation",
    stage: "Arrival Today",
    reason: "Pickup not assigned",
    waiting: "2h",
    coordinator: "Sneha P.",
    nextAction: "Book Kochi driver",
    priority: "Critical",
  },
  {
    id: "RY-2158",
    patient: "Salem Al-Habsi",
    country: "Oman",
    disease: "Pediatric Cardiac",
    stage: "Admission",
    reason: "Emergency consultation",
    waiting: "40m",
    coordinator: "Anjali R.",
    nextAction: "Alert on-call cardiologist",
    priority: "Critical",
  },
];

interface ScheduleItem {
  time: string;
  title: string;
  patient: string;
  location: string;
  coordinator: string;
  tone: Tone;
  icon: LucideIcon;
  status: string;
}

const SCHEDULE: ScheduleItem[] = [
  { time: "08:30", title: "Airport Pickup", patient: "Ahmed Al-Mansoori", location: "Cochin Airport T3", coordinator: "Sneha P.", tone: "info", icon: CarFront, status: "En route" },
  { time: "10:00", title: "Hospital Registration", patient: "Ahmed Al-Mansoori", location: "Aster Medcity", coordinator: "Anjali R.", tone: "primary", icon: Building2, status: "On time" },
  { time: "11:15", title: "OP Consultation", patient: "Noura Al-Zahrani", location: "Dr. Suresh · Amrita", coordinator: "Rahul M.", tone: "info", icon: Stethoscope, status: "Confirmed" },
  { time: "13:30", title: "MRI Scan", patient: "Yousef Al-Rashidi", location: "VPS Lakeshore Imaging", coordinator: "Sneha P.", tone: "accent", icon: Activity, status: "Booked" },
  { time: "15:00", title: "Surgery", patient: "Salem Al-Habsi", location: "Amrita OT-4", coordinator: "Anjali R.", tone: "warning", icon: Scissors, status: "Prep" },
  { time: "17:00", title: "Discharge", patient: "Mariam Hassan", location: "KIMS Health", coordinator: "Rahul M.", tone: "success", icon: LogOut, status: "Cleared" },
  { time: "20:00", title: "Airport Drop", patient: "Fatima Al-Sayed", location: "Cochin Airport T3", coordinator: "Sneha P.", tone: "info", icon: PlaneTakeoff, status: "Scheduled" },
];

interface TravelRow {
  id: string;
  patient: string;
  country: string;
  visa: { label: string; tone: Tone | "muted" };
  flight: string;
  arrival: string;
  pickup: { label: string; tone: Tone | "muted" };
  hotel: { label: string; tone: Tone | "muted" };
  translator: string;
  status: { label: string; tone: Tone | "muted" };
  coordinator: string;
  nextAction: string;
}

const TRAVEL: TravelRow[] = [
  {
    id: "RY-2214",
    patient: "Ahmed Al-Mansoori",
    country: "UAE",
    visa: { label: "Approved", tone: "success" },
    flight: "EK 532 · 09:40",
    arrival: "Today",
    pickup: { label: "Assigned", tone: "success" },
    hotel: { label: "Confirmed", tone: "success" },
    translator: "Arabic — Rania",
    status: { label: "Arrival Today", tone: "info" },
    coordinator: "Sneha P.",
    nextAction: "Confirm meet & greet",
  },
  {
    id: "RY-2201",
    patient: "Yousef Al-Rashidi",
    country: "Kuwait",
    visa: { label: "Processing", tone: "warning" },
    flight: "KU 361 · 14:20",
    arrival: "Tomorrow",
    pickup: { label: "Pending", tone: "muted" },
    hotel: { label: "Confirmed", tone: "success" },
    translator: "Arabic — Yusuf",
    status: { label: "Visa Processing", tone: "warning" },
    coordinator: "Sneha P.",
    nextAction: "Upload passport",
  },
  {
    id: "RY-2176",
    patient: "Khalid Al-Otaibi",
    country: "UAE",
    visa: { label: "Processing", tone: "warning" },
    flight: "EK 534 · 09:40",
    arrival: "Tue, 15:20",
    pickup: { label: "Pending", tone: "muted" },
    hotel: { label: "Held", tone: "info" },
    translator: "Arabic — Rania",
    status: { label: "Flight Booked", tone: "info" },
    coordinator: "Rahul M.",
    nextAction: "Assign driver",
  },
  {
    id: "RY-2189",
    patient: "Mariam Hassan",
    country: "Oman",
    visa: { label: "Approved", tone: "success" },
    flight: "WY 271 · 07:15",
    arrival: "Departed",
    pickup: { label: "Completed", tone: "success" },
    hotel: { label: "Checked-in", tone: "success" },
    translator: "Arabic — Yusuf",
    status: { label: "Completed", tone: "success" },
    coordinator: "Anjali R.",
    nextAction: "Discharge summary",
  },
  {
    id: "RY-2162",
    patient: "Noura Al-Zahrani",
    country: "Bahrain",
    visa: { label: "Approved", tone: "success" },
    flight: "GF 072 · 06:10",
    arrival: "Today",
    pickup: { label: "Unassigned", tone: "danger" },
    hotel: { label: "Confirmed", tone: "success" },
    translator: "Arabic — Rania",
    status: { label: "Arrival Today", tone: "info" },
    coordinator: "Sneha P.",
    nextAction: "Book pickup NOW",
  },
];

interface HospitalRow {
  id: string;
  patient: string;
  hospital: string;
  doctor: string;
  opinion: { label: string; tone: Tone | "muted" };
  quotation: { label: string; tone: Tone | "muted" };
  sla: string;
  slaBreach: boolean;
  coordinator: string;
  nextAction: string;
}

const HOSPITAL_OPS: HospitalRow[] = [
  {
    id: "RY-2214",
    patient: "Fatima Al-Sayed",
    hospital: "Amrita Hospital",
    doctor: "Dr. Suresh (Oncology)",
    opinion: { label: "Waiting", tone: "warning" },
    quotation: { label: "Pending", tone: "muted" },
    sla: "3d 4h · overdue",
    slaBreach: true,
    coordinator: "Rahul M.",
    nextAction: "Escalate",
  },
  {
    id: "RY-2201",
    patient: "Yousef Al-Rashidi",
    hospital: "VPS Lakeshore",
    doctor: "Dr. Menon (Cardiac)",
    opinion: { label: "Received", tone: "success" },
    quotation: { label: "Pending", tone: "warning" },
    sla: "22h",
    slaBreach: false,
    coordinator: "Sneha P.",
    nextAction: "Draft quotation",
  },
  {
    id: "RY-2189",
    patient: "Mariam Hassan",
    hospital: "KIMS Health",
    doctor: "Dr. Nair (Spine)",
    opinion: { label: "Received", tone: "success" },
    quotation: { label: "Sent", tone: "success" },
    sla: "—",
    slaBreach: false,
    coordinator: "Anjali R.",
    nextAction: "Await confirmation",
  },
  {
    id: "RY-2176",
    patient: "Khalid Al-Otaibi",
    hospital: "Aster Medcity",
    doctor: "Dr. Kumar (Hepato)",
    opinion: { label: "Doctor Assigned", tone: "info" },
    quotation: { label: "Pending", tone: "muted" },
    sla: "1d 6h",
    slaBreach: false,
    coordinator: "Rahul M.",
    nextAction: "Chase evaluation",
  },
  {
    id: "RY-2158",
    patient: "Salem Al-Habsi",
    hospital: "Amrita Hospital",
    doctor: "Dr. Iyer (Ped. Cardiac)",
    opinion: { label: "Procedure Scheduled", tone: "primary" },
    quotation: { label: "Sent", tone: "success" },
    sla: "—",
    slaBreach: false,
    coordinator: "Anjali R.",
    nextAction: "Confirm OT slot",
  },
];

interface FollowUp {
  id: string;
  patient: string;
  last: string;
  next: string;
  channel: "WhatsApp" | "Call" | "Email";
  coordinator: string;
  priority: Priority;
  status: { label: string; tone: Tone | "muted" };
}

const FOLLOW_UPS: FollowUp[] = [
  { id: "RY-2189", patient: "Mariam Hassan", last: "Yesterday", next: "Today 16:00", channel: "WhatsApp", coordinator: "Anjali R.", priority: "High", status: { label: "Due", tone: "warning" } },
  { id: "RY-2201", patient: "Yousef Al-Rashidi", last: "2h ago", next: "Today 18:30", channel: "Call", coordinator: "Sneha P.", priority: "Critical", status: { label: "Overdue", tone: "danger" } },
  { id: "RY-2176", patient: "Khalid Al-Otaibi", last: "3d ago", next: "Today 19:00", channel: "WhatsApp", coordinator: "Rahul M.", priority: "High", status: { label: "Due", tone: "warning" } },
  { id: "RY-2098", patient: "Aisha Al-Nuaimi", last: "Today 09:12", next: "Tomorrow 10:00", channel: "Email", coordinator: "Anjali R.", priority: "Medium", status: { label: "Scheduled", tone: "info" } },
  { id: "RY-2074", patient: "Omar Al-Farsi", last: "Today 11:40", next: "Fri 12:00", channel: "Call", coordinator: "Sneha P.", priority: "Low", status: { label: "Scheduled", tone: "muted" } },
];

/* ------------------------------------------------------------------ */
/*  Filters                                                            */
/* ------------------------------------------------------------------ */

const DATE_RANGES = ["Today", "Tomorrow", "This Week"] as const;
const COUNTRIES = ["All", "UAE", "KSA", "Kuwait", "Oman", "Qatar", "Bahrain"] as const;
const COORDINATORS = ["All", "Anjali R.", "Rahul M.", "Sneha P."] as const;
const PRIORITIES = ["All", "Critical", "High", "Medium", "Low"] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

function CommandCenter() {
  const [range, setRange] = useState<(typeof DATE_RANGES)[number]>("Today");
  const [country, setCountry] = useState<(typeof COUNTRIES)[number]>("All");
  const [coordinator, setCoordinator] = useState<(typeof COORDINATORS)[number]>("All");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>("RY-2214");

  const urgent = useMemo(
    () =>
      URGENT_CASES.filter((c) => {
        if (country !== "All" && c.country !== country) return false;
        if (coordinator !== "All" && c.coordinator !== coordinator) return false;
        if (priority !== "All" && c.priority !== priority) return false;
        if (search && !`${c.patient} ${c.disease} ${c.id}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [country, coordinator, priority, search],
  );

  return (
    <>
      <PageHeader
        eyebrow="Live Operations"
        title="Executive Command Center"
        subtitle="Real-time control room — coordinate arrivals, hospital opinions, travel, follow-ups and finance in one workspace."
        actions={
          <>
            <Button variant="outline" size="sm">
              <BellRing className="h-4 w-4" /> Alerts
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Quick Action
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Create or dispatch…</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  { icon: UserPlus, label: "New Lead" },
                  { icon: Upload, label: "Upload Medical Report" },
                  { icon: FileText, label: "Generate Proposal" },
                  { icon: Building2, label: "Assign Hospital" },
                  { icon: Users, label: "Assign Coordinator" },
                  { icon: CarFront, label: "Book Pickup" },
                  { icon: Hotel, label: "Book Hotel" },
                  { icon: Plane, label: "Book Flight" },
                  { icon: Receipt, label: "Create Invoice" },
                  { icon: MessageCircle, label: "WhatsApp Patient" },
                ].map((a) => {
                  const Icon = a.icon;
                  return (
                    <DropdownMenuItem key={a.label}>
                      <Icon className="mr-2 h-4 w-4 text-primary" />
                      {a.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-y border-border bg-surface/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
            {DATE_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  range === r
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <FilterSelect label="Country" value={country} options={COUNTRIES} onChange={setCountry} />
          <FilterSelect label="Coordinator" value={coordinator} options={COORDINATORS} onChange={setCoordinator} />
          <FilterSelect label="Priority" value={priority} options={PRIORITIES} onChange={setPriority} />

          <div className="relative ml-auto w-full sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, case ID, disease…"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-3.5 w-3.5" /> More
          </Button>
        </div>
      </div>

      {/* Section: Today's Operations */}
      <SectionHeader
        eyebrow="Today's Operations"
        title="Operational pulse"
        description="Live counters for every touchpoint of the coordination day. Click any tile to drill in."
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        {OPS_TILES.map((t) => (
          <OpsTile key={t.label} {...t} />
        ))}
      </div>

      {/* Section: Urgent Cases */}
      <SectionHeader
        eyebrow="Urgent Cases"
        title="Requires action now"
        description="Auto-sorted by urgency, SLA breach and priority."
        className="mt-10"
      />
      <Widget
        title="Priority Queue"
        description={`${urgent.length} case${urgent.length === 1 ? "" : "s"} need coordinator attention`}
        contentClassName="p-0"
        actions={
          <Button variant="ghost" size="sm">
            View all
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Disease</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Waiting</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Next Action</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {urgent.map((c) => (
                <Fragment key={c.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-xs font-medium">
                            <Initials name={c.patient} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">{c.patient}</div>
                          <div className="font-numeric text-[11px] text-muted-foreground">{c.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span aria-hidden className="text-base leading-none">
                          {countryFlag(c.country)}
                        </span>
                        {c.country}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{c.disease}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {c.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                      {c.reason}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-numeric text-xs text-warning">
                        <Clock className="h-3 w-3" /> {c.waiting}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                            <Initials name={c.coordinator} />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{c.coordinator}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-foreground">
                      {c.nextAction}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge level={c.priority} />
                    </TableCell>
                    <TableCell>
                      {expanded === c.id ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                  {expanded === c.id && (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={10} className="p-0">
                        <CaseCommandCard urgent={c} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              {urgent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                    No cases match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Widget>

      {/* Section: Today's Schedule + Live Activity */}
      <SectionHeader
        eyebrow="Today's Schedule"
        title="Operations timeline"
        description="Every appointment, transfer and procedure planned for the day."
        className="mt-10"
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Widget title="Today's Schedule" description="Chronological coordination plan" className="xl:col-span-2">
          <ol className="space-y-3">
            {SCHEDULE.map((s) => {
              const Icon = s.icon;
              return (
                <li
                  key={`${s.time}-${s.title}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-background/60 p-3 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
                >
                  <div className="w-14 shrink-0 text-right font-numeric text-sm font-semibold text-foreground">
                    {s.time}
                  </div>
                  <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", TONE_ICON[s.tone])}>
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{s.title}</span>
                      <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px] font-semibold", TONE_BADGE[s.tone])}>
                        {s.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{s.patient}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {s.location}
                      </span>
                      <span>· {s.coordinator}</span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        </Widget>

        <Widget title="Live Activity" description="Real-time operational events">
          <Timeline items={LIVE_ACTIVITY} />
        </Widget>
      </div>

      {/* Section: Travel Operations */}
      <SectionHeader
        eyebrow="Travel Operations"
        title="Visa, flight, pickup & hotel"
        description="Cross-functional travel readiness for every arriving case."
        className="mt-10"
      />
      <Widget title="Travel Board" description="End-to-end travel status" contentClassName="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Visa</TableHead>
                <TableHead>Flight</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Translator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Next Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRAVEL.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{t.patient}</div>
                    <div className="font-numeric text-[11px] text-muted-foreground">{t.id}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <span aria-hidden className="text-base leading-none">
                        {countryFlag(t.country)}
                      </span>
                      {t.country}
                    </span>
                  </TableCell>
                  <TableCell><StatusDot tone={t.visa.tone} label={t.visa.label} /></TableCell>
                  <TableCell className="font-numeric text-xs text-foreground">{t.flight}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.arrival}</TableCell>
                  <TableCell><StatusDot tone={t.pickup.tone} label={t.pickup.label} /></TableCell>
                  <TableCell><StatusDot tone={t.hotel.tone} label={t.hotel.label} /></TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Languages className="h-3 w-3" /> {t.translator}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("h-5 px-2 text-[11px] font-semibold", TONE_BADGE[t.status.tone === "muted" ? "info" : t.status.tone])}>
                      {t.status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.coordinator}</TableCell>
                  <TableCell className="text-sm text-foreground">{t.nextAction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Widget>

      {/* Section: Hospital Operations */}
      <SectionHeader
        eyebrow="Hospital Operations"
        title="Opinions, quotations & SLA"
        description="Track every hospital communication with a live SLA timer."
        className="mt-10"
      />
      <Widget title="Hospital Communication Board" description="Live SLA — late responses turn red" contentClassName="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Opinion</TableHead>
                <TableHead>Quotation</TableHead>
                <TableHead>Response SLA</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Next Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HOSPITAL_OPS.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{h.patient}</div>
                    <div className="font-numeric text-[11px] text-muted-foreground">{h.id}</div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{h.hospital}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{h.doctor}</TableCell>
                  <TableCell><StatusDot tone={h.opinion.tone} label={h.opinion.label} /></TableCell>
                  <TableCell><StatusDot tone={h.quotation.tone} label={h.quotation.label} /></TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-numeric text-xs font-semibold",
                        h.slaBreach
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Clock className="h-3 w-3" /> {h.sla}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{h.coordinator}</TableCell>
                  <TableCell className="text-sm text-foreground">{h.nextAction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Widget>

      {/* Section: Follow-up Center */}
      <SectionHeader
        eyebrow="Follow-up Center"
        title="Coordinator worklist"
        description="One-click WhatsApp, call or email. Complete follow-ups without leaving the screen."
        className="mt-10"
      />
      <Widget title="Follow-ups" description="Sorted by urgency" contentClassName="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Next Follow-up</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FOLLOW_UPS.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{f.patient}</div>
                    <div className="font-numeric text-[11px] text-muted-foreground">{f.id}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.last}</TableCell>
                  <TableCell className="text-xs text-foreground">{f.next}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {f.channel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.coordinator}</TableCell>
                  <TableCell><PriorityBadge level={f.priority} /></TableCell>
                  <TableCell><StatusDot tone={f.status.tone} label={f.status.label} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="WhatsApp">
                        <MessageCircle className="h-3.5 w-3.5 text-success" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Call">
                        <Phone className="h-3.5 w-3.5 text-info" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Email">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Schedule reminder">
                        <CalendarClock className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Mark complete">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Widget>

      {/* Section: Finance Alerts */}
      <SectionHeader
        eyebrow="Finance Alerts"
        title="Operational finance"
        description="Cash-flow signals for today — accounting lives in the Finance module."
        className="mt-10"
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <OpsTile label="Today's Collections" value="₹ 12.4 L" icon={Wallet} tone="success" status="INR" />
        <OpsTile label="Outstanding Payments" value="₹ 38.2 L" icon={Receipt} tone="warning" status="4 cases" />
        <OpsTile label="Hospital Commission Pending" value="₹ 6.8 L" icon={Building2} tone="info" />
        <OpsTile label="Invoices To Generate" value={7} icon={FileText} tone="accent" />
        <OpsTile label="Service Charges Pending" value="₹ 2.1 L" icon={Wallet} tone="primary" />
        <OpsTile label="Expected Collections Today" value="₹ 18.6 L" icon={Sparkles} tone="success" status="Forecast" />
      </div>
      <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Future architecture reserved:</span> Hospital Bill · Original Currency · Exchange Rate · INR Converted Value · Hospital Commission · Riayah Service Charges · Partner Commissions · Expenses · Net Profit. Wired via <code className="font-numeric">src/lib/finance.ts</code>.
      </div>

      {/* Section: AI Placeholders */}
      <SectionHeader
        eyebrow="Operations AI"
        title="Assistants (coming soon)"
        description="Reserved workspace for RiayahOS AI copilots — connects once models are wired."
        className="mt-10"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { icon: BrainCircuit, label: "Operations Assistant", hint: "Ask anything about today's ops" },
          { icon: ShieldAlert, label: "Delay Detection", hint: "Auto-flag stalled cases" },
          { icon: Sparkles, label: "Follow-up Recommendations", hint: "Suggest next best action" },
          { icon: Users, label: "Coordinator Workload", hint: "Rebalance in one click" },
          { icon: Activity, label: "Resource Allocation", hint: "Optimise pickup & translator" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.label}
              className="surface-card relative overflow-hidden p-4 opacity-90"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{a.label}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{a.hint}</div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="absolute right-3 top-3 h-5 border-accent/30 bg-accent/10 px-1.5 text-[10px] font-semibold text-accent-foreground"
              >
                Soon
              </Badge>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-xl text-xs text-muted-foreground sm:text-sm">{description}</p>
        )}
      </div>
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-semibold text-foreground">{value}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((o) => (
          <DropdownMenuItem key={o} onClick={() => onChange(o)}>
            {o}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CaseCommandCard({ urgent }: { urgent: UrgentCase }) {
  return (
    <div className="grid gap-4 p-5 md:grid-cols-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Case
        </div>
        <div className="mt-1 font-display text-base font-semibold text-foreground">{urgent.patient}</div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{countryFlag(urgent.country)}</span> {urgent.country} · {urgent.disease}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">{urgent.stage}</Badge>
          <PriorityBadge level={urgent.priority} />
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Team
        </div>
        <div className="mt-2 space-y-1.5 text-xs">
          <div><span className="text-muted-foreground">Coordinator:</span> <span className="font-medium text-foreground">{urgent.coordinator}</span></div>
          <div><span className="text-muted-foreground">Hospital:</span> <span className="font-medium text-foreground">Amrita Hospital</span></div>
          <div><span className="text-muted-foreground">Doctor:</span> <span className="font-medium text-foreground">Dr. Suresh</span></div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tasks
        </div>
        <ul className="mt-2 space-y-1.5 text-xs">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
            <span className="text-foreground">{urgent.nextAction}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
            <span className="text-muted-foreground">Send follow-up to family</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
            <span className="text-muted-foreground">Confirm translator availability</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Expected Revenue
          </div>
          <div className="mt-1 font-numeric text-xl font-semibold text-foreground">₹ 4.8 L</div>
          <div className="text-[11px] text-muted-foreground">AED 21,000 · rate captured</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]">
            <MessageCircle className="h-3 w-3" /> WhatsApp
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]">
            <Phone className="h-3 w-3" /> Call
          </Button>
          <Button size="sm" className="h-7 gap-1 text-[11px]">
            Open case
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Live activity timeline items                                       */
/* ------------------------------------------------------------------ */

const LIVE_ACTIVITY: TimelineItem[] = [
  { icon: Upload, title: "MRI uploaded", description: "RY-2214 · Fatima Al-Sayed · by Family", time: "2m", tone: "info" },
  { icon: MessageSquareQuote, title: "Hospital opinion received", description: "Dr. Menon · VPS Lakeshore · RY-2201", time: "18m", tone: "primary" },
  { icon: FileText, title: "Proposal generated", description: "Aster Medcity · by Anjali", time: "42m", tone: "info" },
  { icon: CheckCircle2, title: "Patient confirmed", description: "Al-Mansoori family approved plan", time: "1h", tone: "success" },
  { icon: Plane, title: "Visa approved", description: "RY-2214 · cleared by VFS Dubai", time: "2h", tone: "success" },
  { icon: PlaneTakeoff, title: "Flight booked", description: "EK 534 · Tue 09:40 · RY-2176", time: "3h", tone: "warning" },
  { icon: CarFront, title: "Pickup assigned", description: "Kochi driver · RY-2214", time: "4h", tone: "info" },
  { icon: PlaneLanding, title: "Patient arrived", description: "Noura Al-Zahrani · Cochin T3", time: "5h", tone: "success" },
  { icon: Stethoscope, title: "OP consultation completed", description: "Dr. Suresh · RY-2098", time: "6h", tone: "success" },
  { icon: Scissors, title: "Surgery started", description: "Salem Al-Habsi · Amrita OT-4", time: "7h", tone: "warning" },
  { icon: LogOut, title: "Discharged", description: "Mariam Hassan · KIMS Health", time: "9h", tone: "success" },
];
