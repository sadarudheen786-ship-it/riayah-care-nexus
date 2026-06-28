import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  UserPlus,
  Stethoscope,
  Wallet,
  Plus,
  Download,
  FileText,
  CheckCircle2,
  MessageSquare,
  Plane,
  Activity,
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
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — RiayahOS" },
      {
        name: "description",
        content:
          "Executive overview of leads, patients, hospitals, and operations across Riayah Care.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Executive Overview"
        title="Dashboard"
        subtitle="A real-time view of patient flow, partner hospitals and revenue across all GCC markets."
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
          label="Patients in Care"
          value="62"
          delta={{ value: "+4", trend: "up" }}
          hint="across 14 hospitals"
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Specialists Engaged"
          value="187"
          delta={{ value: "+8", trend: "up" }}
          hint="cardiology trending"
          icon={Stethoscope}
          tone="accent"
        />
        <StatCard
          label="Revenue (MTD)"
          value="AED 1.42M"
          delta={{ value: "+6.1%", trend: "up" }}
          hint="vs last month"
          icon={Wallet}
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Widget
          title="Patient Pipeline"
          description="Lead-to-treatment conversion by stage"
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
              { label: "Proposal Sent", value: 98, pct: 40, tone: "bg-info" },
              { label: "Visa & Travel", value: 47, pct: 19, tone: "bg-accent" },
              { label: "Admitted", value: 28, pct: 11, tone: "bg-success" },
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

        <Widget title="Recent Activity" description="Latest events across the workspace">
          <Timeline
            items={[
              {
                icon: UserPlus,
                title: "New lead from Riyadh",
                description: "Cardiology consult requested",
                time: "2m",
                tone: "primary",
              },
              {
                icon: FileText,
                title: "Proposal #PR-2041 sent",
                description: "Aster Medcity — orthopedics",
                time: "1h",
                tone: "info",
              },
              {
                icon: CheckCircle2,
                title: "Visa approved",
                description: "Patient RY-2104 cleared",
                time: "3h",
                tone: "success",
              },
              {
                icon: Plane,
                title: "Arrival scheduled",
                description: "BLR · Tomorrow 09:40",
                time: "5h",
                tone: "warning",
              },
              {
                icon: MessageSquare,
                title: "Second opinion received",
                description: "Dr. Suresh — oncology",
                time: "1d",
                tone: "info",
              },
            ]}
          />
        </Widget>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Widget
          title="Active Patients"
          description="Currently under coordination"
          className="xl:col-span-2"
          actions={
            <Button variant="ghost" size="sm">
              See all
            </Button>
          }
          contentClassName="p-0"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  name: "Ahmed Al-Mansoori",
                  country: "UAE",
                  hospital: "Aster Medcity",
                  specialty: "Cardiology",
                  stage: "Admitted",
                  tone: "success" as const,
                  progress: 80,
                },
                {
                  name: "Fatima Al-Sayed",
                  country: "KSA",
                  hospital: "Amrita Hospital",
                  specialty: "Oncology",
                  stage: "Pre-Op",
                  tone: "info" as const,
                  progress: 55,
                },
                {
                  name: "Yousef Al-Rashidi",
                  country: "Kuwait",
                  hospital: "VPS Lakeshore",
                  specialty: "Orthopedics",
                  stage: "Travel",
                  tone: "warning" as const,
                  progress: 35,
                },
                {
                  name: "Mariam Hassan",
                  country: "Oman",
                  hospital: "KIMS Health",
                  specialty: "Neurology",
                  stage: "Proposal",
                  tone: "secondary" as const,
                  progress: 20,
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
                  <TableCell className="text-muted-foreground">{p.country}</TableCell>
                  <TableCell className="text-muted-foreground">{p.hospital}</TableCell>
                  <TableCell className="text-muted-foreground">{p.specialty}</TableCell>
                  <TableCell>
                    <Badge variant={p.tone === "warning" ? "outline" : "secondary"}>
                      {p.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={p.progress} className="h-1.5 w-24" />
                      <span className="font-numeric text-xs text-muted-foreground">
                        {p.progress}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
