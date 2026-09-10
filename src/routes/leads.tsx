import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileText,
  Inbox,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Widget } from "@/components/common/Widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createManualLead,
  getLeadDashboard,
  getLeadDetail,
  overrideLeadPriority,
  reviewExtractedFact,
  type LeadRow,
} from "@/lib/leads.functions";

const priorityTone: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-info/10 text-info border-info/20",
  low: "bg-muted text-muted-foreground border-border",
};

function relativeTime(value: string | null) {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function titleCase(value: string | null | undefined) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Inbox className="h-7 w-7 text-muted-foreground/60" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Lead Management — RiayahOS" },
      {
        name: "description",
        content:
          "Live multi-channel patient enquiries with AI-assisted extraction, triage and coordinator routing.",
      },
      { property: "og:title", content: "Lead Management — RiayahOS" },
      {
        property: "og:description",
        content: "Real-time patient enquiry intake, AI triage and conversion tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeadManagement,
});

function LeadManagement() {
  const queryClient = useQueryClient();
  const fetchDashboard = useServerFn(getLeadDashboard);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);

  const dashboard = useQuery({
    queryKey: ["lead-dashboard"],
    queryFn: () => fetchDashboard(),
    refetchInterval: 60_000,
  });

  const data = dashboard.data;
  const leads = data?.leads ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (stageFilter !== "all" && lead.stage !== stageFilter) return false;
      if (priorityFilter !== "all" && lead.urgency !== priorityFilter) return false;
      if (sourceFilter !== "all" && (lead.source ?? "unknown") !== sourceFilter) return false;
      if (!term) return true;
      return [lead.name, lead.country, lead.condition, lead.phone, lead.whatsapp]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [leads, search, stageFilter, priorityFilter, sourceFilter]);

  const k = data?.kpis;
  const maxFunnel = Math.max(1, ...(data?.funnel ?? []).map((f) => f.count));

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["lead-dashboard"] });

  return (
    <div>
      <PageHeader
        eyebrow="Module 2.1"
        title="Lead Management"
        subtitle="Every genuine enquiry received across WhatsApp, website, Messenger, Instagram, ads, email and referrals — structured and prioritised by AI, decided by your team."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh} disabled={dashboard.isFetching}>
              {dashboard.isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Activity className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button size="sm" onClick={() => setNewLeadOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </>
        }
      />

      {dashboard.isError && (
        <div className="surface-card mb-6 flex items-center gap-3 border-destructive/30 p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Unable to load live lead data. Sign in with a staff account and try again.
        </div>
      )}

      {/* KPIs — real counts only */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Total Leads" value={String(k?.totalLeads ?? 0)} icon={Users} />
        <StatCard label="New Leads" value={String(k?.newLeads ?? 0)} icon={Sparkles} tone="info" />
        <StatCard
          label="Uncontacted"
          value={String(k?.uncontacted ?? 0)}
          icon={MessageCircle}
          tone="warning"
        />
        <StatCard
          label="Reports Pending"
          value={String(k?.reportsPending ?? 0)}
          icon={FileText}
          tone="warning"
        />
        <StatCard
          label="Medical Review"
          value={String(k?.medicalReviewPending ?? 0)}
          icon={Stethoscope}
        />
        <StatCard
          label="Opinions Pending"
          value={String(k?.hospitalOpinionPending ?? 0)}
          icon={ClipboardList}
        />
        <StatCard label="Proposal Stage" value={String(k?.proposalStage ?? 0)} icon={FileText} />
        <StatCard
          label="Converted"
          value={String(k?.converted ?? 0)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard label="Lost" value={String(k?.lost ?? 0)} icon={XCircle} />
        <StatCard
          label="Unassigned"
          value={String(k?.unassigned ?? 0)}
          icon={Users}
          tone="warning"
          hint="Awaiting coordinator"
        />
        <StatCard
          label="Possible Duplicates"
          value={String(k?.needsIdentityReview ?? 0)}
          icon={Copy}
          tone="warning"
          hint="Human review required"
        />
        <StatCard
          label="Conflicting Info"
          value={String(k?.conflictingFacts ?? 0)}
          icon={AlertTriangle}
          tone="warning"
          hint="Both versions preserved"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {/* Conversion funnel */}
          <Widget
            title="Lead Conversion Funnel"
            description="Live distribution of enquiries across the lead workflow."
          >
            {leads.length === 0 ? (
              <EmptyState
                title="No enquiries captured yet"
                hint="Leads appear here automatically the moment a genuine enquiry arrives from WhatsApp, the website, Messenger, Instagram, a lead ad, email or a manual entry."
              />
            ) : (
              <div className="grid gap-2">
                {data?.funnel.map((stage) => (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-xs font-medium text-muted-foreground">
                      {stage.stage}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(stage.count / maxFunnel) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-numeric text-sm font-semibold">
                      {stage.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Widget>

          {/* Lead table */}
          <Widget
            title="All Leads"
            description={`${filtered.length} of ${leads.length} enquiries`}
            contentClassName="p-0"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search leads"
                    className="h-9 w-44 pl-8"
                  />
                </div>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stages</SelectItem>
                    {data?.funnel.map((f) => (
                      <SelectItem key={f.stage} value={f.stage}>
                        {f.stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sources</SelectItem>
                    {data?.bySource.map((s) => (
                      <SelectItem key={s.source} value={s.source}>
                        {titleCase(s.source)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          >
            {dashboard.isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading live enquiries…
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title={leads.length === 0 ? "No leads yet" : "No leads match these filters"}
                hint={
                  leads.length === 0
                    ? "Connect a channel or add a lead manually. Nothing is simulated — this table only ever shows genuine enquiries."
                    : "Adjust the search or filters to see other enquiries."
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Coordinator</TableHead>
                    <TableHead>Last contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead) => (
                    <TableRow
                      key={lead.caseId}
                      className="cursor-pointer"
                      onClick={() => setSelected(lead)}
                    >
                      <TableCell>
                        <div className="font-medium text-foreground">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {lead.whatsapp ?? lead.phone ?? "No contact number"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{lead.country ?? "—"}</TableCell>
                      <TableCell className="text-sm">
                        {lead.condition ?? (
                          <span className="text-muted-foreground">Not stated yet</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{titleCase(lead.source)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.stage}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge className={cn("border", priorityTone[lead.urgency])}>
                            {titleCase(lead.urgency)}
                          </Badge>
                          {lead.aiPriority && !lead.humanConfirmed && (
                            <BrainCircuit className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          {lead.hasConflicts && (
                            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.coordinator ?? (
                          <span className="text-warning">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {relativeTime(lead.lastContactAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Widget>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Widget title="Intake Health" description="Live status of the capture pipeline.">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Events today</dt>
                <dd className="font-numeric font-semibold">{data?.intakeHealth.receivedToday ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Needs review</dt>
                <dd className="font-numeric font-semibold">{data?.intakeHealth.needsReview ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Failed</dt>
                <dd className="font-numeric font-semibold">{data?.intakeHealth.failed ?? 0}</dd>
              </div>
              <Separator />
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last event</dt>
                <dd>{relativeTime(data?.intakeHealth.lastEventAt ?? null)}</dd>
              </div>
            </dl>
          </Widget>

          <Widget title="Enquiries by Source" description="Attribution from real captured events.">
            {(data?.bySource.length ?? 0) === 0 ? (
              <EmptyState title="No attribution yet" hint="Source data appears as enquiries arrive." />
            ) : (
              <ul className="space-y-2 text-sm">
                {data?.bySource.map((s) => (
                  <li key={s.source} className="flex items-center justify-between">
                    <span>{titleCase(s.source)}</span>
                    <span className="font-numeric font-semibold">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Widget>

          <Widget title="Recent Enquiries" description="Newest genuine leads first.">
            {leads.length === 0 ? (
              <EmptyState title="Nothing captured yet" hint="New enquiries will appear here instantly." />
            ) : (
              <ul className="space-y-3">
                {leads.slice(0, 6).map((lead) => (
                  <li key={lead.caseId}>
                    <button
                      className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
                      onClick={() => setSelected(lead)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{lead.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {relativeTime(lead.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {titleCase(lead.source)} · {lead.stage}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Widget>
        </div>
      </div>

      <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} onChanged={refresh} />
      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} onCreated={refresh} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function NewLeadDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const create = useServerFn(createManualLead);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    country: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: () => create({ data: { ...form, channel: "manual" as const } }),
    onSuccess: () => {
      toast.success("Lead captured and sent through the intake pipeline.");
      onOpenChange(false);
      setForm({ name: "", phone: "", whatsapp: "", email: "", country: "", message: "" });
      onCreated();
    },
    onError: (error: Error) => toast.error(error.message || "Could not create the lead."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Lead</DialogTitle>
          <DialogDescription>
            Manually captured enquiries go through the same AI extraction, triage and routing as
            every other channel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="lead-name">Patient / enquirer name</Label>
            <Input
              id="lead-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lead-wa">WhatsApp</Label>
              <Input
                id="lead-wa"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lead-country">Country</Label>
              <Input
                id="lead-country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="lead-message">What the patient said</Label>
            <Textarea
              id="lead-message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Paste the enquiry exactly as received. Only explicitly stated information is extracted."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || form.name.trim().length === 0}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Capture Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */

function LeadDetailSheet({
  lead,
  onClose,
  onChanged,
}: {
  lead: LeadRow | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const fetchDetail = useServerFn(getLeadDetail);
  const override = useServerFn(overrideLeadPriority);
  const review = useServerFn(reviewExtractedFact);
  const [overrideReason, setOverrideReason] = useState("");
  const [overridePriority, setOverridePriority] = useState("high");

  const detail = useQuery({
    queryKey: ["lead-detail", lead?.caseId],
    queryFn: () => fetchDetail({ data: { caseId: lead!.caseId } }),
    enabled: Boolean(lead),
  });

  const overrideMutation = useMutation({
    mutationFn: () =>
      override({
        data: {
          caseId: lead!.caseId,
          priority: overridePriority as "low" | "medium" | "high" | "critical",
          reason: overrideReason,
        },
      }),
    onSuccess: () => {
      toast.success("Priority updated by human decision.");
      setOverrideReason("");
      detail.refetch();
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviewMutation = useMutation({
    mutationFn: (vars: { factId: string; decision: "confirmed" | "rejected" }) =>
      review({ data: vars }),
    onSuccess: () => {
      detail.refetch();
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const currentTriage = detail.data?.triage.find((t) => t.is_current);

  return (
    <Sheet open={Boolean(lead)} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>{lead?.name ?? "Lead"}</SheetTitle>
          <p className="text-xs text-muted-foreground">
            {titleCase(lead?.source)} · {lead?.country ?? "Country not stated"} ·{" "}
            {lead?.stage}
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="space-y-6 px-6 py-5">
            <Tabs defaultValue="ai">
              <TabsList className="w-full">
                <TabsTrigger value="ai" className="flex-1">
                  AI Assessment
                </TabsTrigger>
                <TabsTrigger value="evidence" className="flex-1">
                  Evidence
                </TabsTrigger>
                <TabsTrigger value="conversation" className="flex-1">
                  Conversation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="mt-4 space-y-4">
                {detail.isLoading ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <div className="surface-card p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                        Recommended priority
                      </div>
                      {currentTriage ? (
                        <>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              className={cn(
                                "border",
                                priorityTone[currentTriage.recommended_priority ?? "medium"],
                              )}
                            >
                              {titleCase(currentTriage.recommended_priority)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              decided by {currentTriage.decided_by_type === "human" ? "your team" : "AI"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {currentTriage.reason ?? "No reason recorded."}
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No assessment recorded yet.
                        </p>
                      )}
                      <p className="mt-3 text-[11px] text-muted-foreground">
                        AI output is a recommendation only. It is never a diagnosis and always
                        requires human review.
                      </p>
                    </div>

                    <div className="surface-card space-y-3 p-4">
                      <div className="text-sm font-semibold">Human override</div>
                      <Select value={overridePriority} onValueChange={setOverridePriority}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        rows={2}
                        placeholder="Reason for the change (recorded in the audit trail)"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={() => overrideMutation.mutate()}
                        disabled={overrideReason.trim().length < 3 || overrideMutation.isPending}
                      >
                        {overrideMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Apply override
                      </Button>
                    </div>

                    {(detail.data?.triage.length ?? 0) > 1 && (
                      <div className="surface-card p-4">
                        <div className="text-sm font-semibold">Assessment history</div>
                        <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                          {detail.data?.triage.map((t) => (
                            <li key={t.id} className="flex justify-between gap-3">
                              <span>
                                {titleCase(t.recommended_priority)} ·{" "}
                                {t.decided_by_type === "human" ? "human" : "AI"}
                              </span>
                              <span>{relativeTime(t.created_at)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="evidence" className="mt-4 space-y-3">
                {(detail.data?.facts.length ?? 0) === 0 ? (
                  <EmptyState
                    title="No extracted information yet"
                    hint="Every captured field is stored with the exact patient statement or document it came from."
                  />
                ) : (
                  detail.data?.facts.map((fact) => (
                    <div key={fact.id} className="surface-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            {titleCase(fact.field_key)}
                          </div>
                          <div className="text-sm font-medium">{fact.value_text ?? "—"}</div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            fact.status === "conflicted" && "border-warning/30 text-warning",
                            fact.status === "confirmed" && "border-success/30 text-success",
                          )}
                        >
                          {titleCase(fact.status)}
                        </Badge>
                      </div>
                      {fact.source_quote && (
                        <blockquote className="mt-2 border-l-2 border-border pl-3 text-xs italic text-muted-foreground">
                          “{fact.source_quote}”
                        </blockquote>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          Source: {titleCase(fact.source)}
                        </span>
                        {fact.status !== "confirmed" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                reviewMutation.mutate({ factId: fact.id, decision: "confirmed" })
                              }
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                reviewMutation.mutate({ factId: fact.id, decision: "rejected" })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="conversation" className="mt-4 space-y-3">
                {(detail.data?.communications.length ?? 0) === 0 ? (
                  <EmptyState
                    title="No messages recorded"
                    hint="Incoming and outgoing messages appear here once a channel is connected."
                  />
                ) : (
                  detail.data?.communications.map((c) => (
                    <div key={c.id} className="surface-card p-3">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {titleCase(c.channel)} · {titleCase(c.direction)}
                        </span>
                        <span>{relativeTime(c.occurred_at)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{c.body ?? "—"}</p>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
