import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  UserPlus,
  MessageSquareQuote,
  Wallet,
  Plus,
  Download,
  FileText,
  CheckCircle2,
  Plane,
  Activity,
  Upload,
  Stethoscope,
  PlaneTakeoff,
  CarFront,
  Receipt,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Widget } from "@/components/common/Widget";
import { Timeline } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countryFlag } from "@/lib/flags";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — RiayahOS" },
      {
        name: "description",
        content:
          "Real-time overview of Riayah Care operations: leads, active cases, hospital opinions and revenue across GCC markets.",
      },
    ],
  }),
  component: Dashboard,
});

type Priority = "Critical" | "High" | "Medium" | "Low";

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

function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Executive Overview"
        title="Operations Dashboard"
        subtitle="Real-time overview of Riayah Care operations across GCC markets and partner hospitals in Kerala."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Lead
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Leads"
          value="248"
          delta={{ value: "+12.4%", trend: "up" }}
          hint="vs last 30 days"
          icon={UserPlus}
          tone="primary"
        />
        <StatCard
          label="Active Cases"
          value="62"
          delta={{ value: "+4", trend: "up" }}
          hint="patients under coordination"
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Hospital Opinions Pending"
          value="18"
          delta={{ value: "-3", trend: "down" }}
          hint="awaiting specialist reply"
          icon={MessageSquareQuote}
          tone="accent"
        />
        <StatCard
          label="Revenue (Month to Date)"
          value="₹ 1.42 Cr"
          delta={{ value: "+6.1%", trend: "up" }}
          hint="reported in INR"
          icon={Wallet}
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Widget
          title="Patient Workflow"
          description="Cases by current stage in the coordination journey"
          className="xl:col-span-2"
          actions={
            <Button variant="ghost" size="sm">
              View report
            </Button>
          }
        >
          <div className="space-y-5">
            {[
              { label: "New Inquiry", value: 248, pct: 100, tone: "bg-primary" },
              { label: "Medical Review", value: 162, pct: 65, tone: "bg-secondary" },
              { label: "Hospital Opinion", value: 124, pct: 50, tone: "bg-info" },
              { label: "Proposal Sent", value: 98, pct: 40, tone: "bg-accent" },
              { label: "Patient Decision", value: 72, pct: 29, tone: "bg-warning" },
              { label: "Travel Planning", value: 47, pct: 19, tone: "bg-info" },
              { label: "Treatment Journey", value: 28, pct: 11, tone: "bg-success" },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{row.label}</span>
                  <span className="font-numeric text-muted-foreground">{row.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${row.tone} transition-all duration-700`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Recent Activity" description="Latest events across cases">
          <Timeline
            items={[
              {
                icon: Upload,
                title: "MRI uploaded",
                description: "Case RY-2104 · by Family · 2m",
                time: "2m",
                tone: "info",
              },
              {
                icon: Stethoscope,
                title: "Hospital opinion received",
                description: "Dr. Suresh, Amrita · Oncology",
                time: "1h",
                tone: "primary",
              },
              {
                icon: FileText,
                title: "Proposal generated",
                description: "Aster Medcity · by Anjali",
                time: "2h",
                tone: "info",
              },
              {
                icon: CheckCircle2,
                title: "Patient confirmed",
                description: "Al-Mansoori family approved plan",
                time: "3h",
                tone: "success",
              },
              {
                icon: Plane,
                title: "Visa approved",
                description: "RY-2104 cleared by Coordinator",
                time: "5h",
                tone: "success",
              },
              {
                icon: PlaneTakeoff,
                title: "Flight booked",
                description: "BLR · Tomorrow 09:40",
                time: "6h",
                tone: "warning",
              },
              {
                icon: CarFront,
                title: "Pickup scheduled",
                description: "Driver assigned · Kochi airport",
                time: "8h",
                tone: "info",
              },
              {
                icon: Receipt,
                title: "Payment received",
                description: "INV-1042 · AED 18,500",
                time: "1d",
                tone: "success",
              },
            ]}
          />
        </Widget>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Widget
          title="Active Cases"
          description="Cases requiring coordination action"
          className="xl:col-span-2"
          actions={
            <Button variant="ghost" size="sm">
              See all
            </Button>
          }
          contentClassName="p-0"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Coordinator</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Next Action</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    name: "Ahmed Al-Mansoori",
                    country: "UAE",
                    hospital: "Aster Medcity",
                    coordinator: { name: "Anjali R.", initials: "AR" },
                    stage: "Treatment Journey",
                    next: "Daily progress note",
                    priority: "High" as Priority,
                    status: "On Track",
                    statusTone: "success" as const,
                  },
                  {
                    name: "Fatima Al-Sayed",
                    country: "KSA",
                    hospital: "Amrita Hospital",
                    coordinator: { name: "Rahul M.", initials: "RM" },
                    stage: "Hospital Opinion",
                    next: "Chase Dr. Suresh reply",
                    priority: "Critical" as Priority,
                    status: "Waiting",
                    statusTone: "warning" as const,
                  },
                  {
                    name: "Yousef Al-Rashidi",
                    country: "Kuwait",
                    hospital: "VPS Lakeshore",
                    coordinator: { name: "Sneha P.", initials: "SP" },
                    stage: "Travel Planning",
                    next: "Confirm visa documents",
                    priority: "Medium" as Priority,
                    status: "In Progress",
                    statusTone: "info" as const,
                  },
                  {
                    name: "Mariam Hassan",
                    country: "Oman",
                    hospital: "KIMS Health",
                    coordinator: { name: "Anjali R.", initials: "AR" },
                    stage: "Proposal Sent",
                    next: "Follow up on decision",
                    priority: "Low" as Priority,
                    status: "Awaiting Reply",
                    statusTone: "muted" as const,
                  },
                ].map((p) => (
                  <TableRow key={p.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-xs font-medium">
                            {p.name
                              .split(" ")
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span aria-hidden className="text-base leading-none">
                          {countryFlag(p.country)}
                        </span>
                        {p.country}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.hospital}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                            {p.coordinator.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {p.coordinator.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {p.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-foreground">
                      {p.next}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge level={p.priority} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          p.statusTone === "success" && "text-success",
                          p.statusTone === "warning" && "text-warning",
                          p.statusTone === "info" && "text-info",
                          p.statusTone === "muted" && "text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            p.statusTone === "success" && "bg-success",
                            p.statusTone === "warning" && "bg-warning animate-pulse",
                            p.statusTone === "info" && "bg-info",
                            p.statusTone === "muted" && "bg-muted-foreground/50",
                          )}
                        />
                        {p.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Widget>

        <Widget title="System Health" description="Platform & integrations">
          <ul className="space-y-3">
            {[
              { label: "Lead intake API", status: "Operational", tone: "success" },
              { label: "Hospital sync", status: "Operational", tone: "success" },
              { label: "Document vault", status: "Operational", tone: "success" },
              { label: "WhatsApp gateway", status: "Degraded", tone: "warning" },
            ].map((s) => (
              <li
                key={s.label}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      s.tone === "success" ? "bg-success" : "bg-warning"
                    } ${s.tone === "warning" ? "animate-pulse" : ""}`}
                  />
                  <span className="text-sm text-foreground">{s.label}</span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    s.tone === "success" ? "text-success" : "text-warning"
                  }`}
                >
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              Uptime · last 30 days
            </div>
            <div className="mt-2 font-numeric text-2xl font-semibold text-foreground">
              99.98%
            </div>
            <p className="text-xs text-muted-foreground">
              Riayah platform is performing within SLA.
            </p>
          </div>
        </Widget>
      </div>
    </>
  );
}
