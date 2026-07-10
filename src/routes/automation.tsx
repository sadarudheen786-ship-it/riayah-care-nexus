import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ActivitySquare,
  AlertTriangle,
  ArrowRight,
  Beaker,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FlaskConical,
  Info,
  ListChecks,
  Loader2,
  Play,
  Plug,
  Plus,
  Power,
  Search,
  Settings2,
  Sparkles,
  Timer,
  Upload,
  Workflow,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Widget } from "@/components/common/Widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ACTIONS,
  ACTION_MAP,
  CATEGORY_MAP,
  INTEGRATION_HOOKS,
  RULE_CATEGORIES,
  SYSTEM_RULES,
  TRIGGERS,
  TRIGGER_MAP,
  formatCondition,
  priorityTone,
  statusTone,
  type AutomationRule,
  type ExecutionLog,
  type RuleCategoryId,
  type RulePriority,
  type RuleStatus,
} from "@/lib/automation";

export const Route = createFileRoute("/automation")({
  head: () => ({
    meta: [
      { title: "Workflow Automation Engine · RiayahOS" },
      {
        name: "description",
        content:
          "Central rule engine for RiayahOS — define triggers, conditions, and actions that respond to business events.",
      },
    ],
  }),
  component: AutomationPage,
});

const PAGE_SIZE = 8;

function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>(SYSTEM_RULES);
  const [logs] = useState<ExecutionLog[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | RuleCategoryId>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | RuleStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | RulePriority>("all");
  const [page, setPage] = useState(1);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [testRule, setTestRule] = useState<AutomationRule | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [newRuleOpen, setNewRuleOpen] = useState(false);

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          TRIGGER_MAP[r.trigger].label.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rules, query, categoryFilter, statusFilter, priorityFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // KPI counts
  const kpi = useMemo(() => {
    const total = rules.length;
    const active = rules.filter((r) => r.status === "active").length;
    const inactive = rules.filter((r) => r.status === "inactive").length;
    const failed = rules.reduce((s, r) => s + r.failureCount, 0);
    const successToday = rules.reduce((s, r) => s + r.successCount, 0);
    const pending = rules.filter((r) => r.status === "draft").length;
    const avgMs = 0;
    return { total, active, inactive, failed, successToday, pending, avgMs };
  }, [rules]);

  const toggleRule = (id: string, next: boolean) => {
    setRules((rs) =>
      rs.map((r) =>
        r.id === id
          ? { ...r, status: next ? "active" : "inactive", lastModifiedAt: new Date().toISOString() }
          : r,
      ),
    );
    toast.success(next ? "Rule activated" : "Rule paused");
  };

  const runTest = (rule: AutomationRule) => {
    setTestRule(rule);
    setTestOutput(null);
    setTestRunning(true);
    setTimeout(() => {
      setTestRunning(false);
      const trigger = TRIGGER_MAP[rule.trigger];
      const actions = rule.actions.map((a) => ACTION_MAP[a].label);
      setTestOutput(
        [
          `[dry-run] ${new Date().toLocaleTimeString()}`,
          `trigger  → ${trigger.label} (${trigger.source})`,
          `matches  → ${rule.conditions.length === 0 ? "no conditions" : `${rule.conditions.length} condition(s) evaluated`}`,
          ...rule.conditions.map((c, i) => `  ${i + 1}. ${formatCondition(c)}  → ✓ pass (simulated)`),
          `pipeline → ${actions.join("  →  ")}`,
          `status   → simulated ok · ${Math.floor(200 + Math.random() * 400)}ms`,
          `note     → integrations are reserved; no side-effects executed.`,
        ].join("\n"),
      );
    }, 900);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Module 5.1 · Automation"
        title="Workflow Automation Engine"
        subtitle="Central rule engine that maps business events to actions across every RiayahOS module. Integrations are reserved and not yet live."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-1.5 h-4 w-4" /> Import
            </Button>
            <Button size="sm" onClick={() => setNewRuleOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New Rule
            </Button>
          </>
        }
      />

      {/* KPI grid */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total Rules" value={String(kpi.total)} icon={Workflow} tone="primary" />
        <StatCard label="Active" value={String(kpi.active)} icon={Zap} tone="success" hint="Live" />
        <StatCard label="Inactive" value={String(kpi.inactive)} icon={Power} tone="warning" />
        <StatCard label="Failed" value={String(kpi.failed)} icon={XCircle} tone="warning" hint="Last 24h" />
        <StatCard label="Successful Today" value={String(kpi.successToday)} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={String(kpi.pending)} icon={Clock} tone="info" />
        <StatCard label="Avg Execution" value={`${kpi.avgMs}ms`} icon={Timer} tone="info" hint="Rolling avg" />
      </section>

      <Tabs defaultValue="rules" className="mt-6">
        <TabsList>
          <TabsTrigger value="rules">
            <ListChecks className="mr-1.5 h-4 w-4" /> Rules
          </TabsTrigger>
          <TabsTrigger value="visualizer">
            <Workflow className="mr-1.5 h-4 w-4" /> Visualizer
          </TabsTrigger>
          <TabsTrigger value="logs">
            <ActivitySquare className="mr-1.5 h-4 w-4" /> Execution Log
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="mr-1.5 h-4 w-4" /> Integrations
          </TabsTrigger>
        </TabsList>

        {/* ─── Rules tab ─── */}
        <TabsContent value="rules" className="mt-4 space-y-4">
          {/* Category rail */}
          <Widget title="Rule Categories" description="Filter the library by operational domain.">
            <div className="flex flex-wrap gap-2">
              <CategoryChip
                label={`All · ${rules.length}`}
                active={categoryFilter === "all"}
                onClick={() => {
                  setCategoryFilter("all");
                  setPage(1);
                }}
              />
              {RULE_CATEGORIES.map((c) => {
                const count = rules.filter((r) => r.category === c.id).length;
                const Icon = c.icon;
                return (
                  <CategoryChip
                    key={c.id}
                    icon={Icon}
                    label={`${c.label} · ${count}`}
                    active={categoryFilter === c.id}
                    onClick={() => {
                      setCategoryFilter(c.id);
                      setPage(1);
                    }}
                  />
                );
              })}
            </div>
          </Widget>

          {/* Filters + search */}
          <div className="surface-card flex flex-col gap-3 p-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search rules by name, trigger, or description…"
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as typeof statusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(v) => {
                setPriorityFilter(v as typeof priorityFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-[160px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rule table */}
          <div className="surface-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="hidden xl:table-cell">Created By</TableHead>
                  <TableHead className="hidden xl:table-cell">Last Modified</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Last Executed</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead className="w-[80px] text-right">…</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                      No rules match the current filters.
                    </TableCell>
                  </TableRow>
                )}
                {paged.map((r) => {
                  const trig = TRIGGER_MAP[r.trigger];
                  const TIcon = trig.icon;
                  const cat = CATEGORY_MAP[r.category];
                  const CIcon = cat.icon;
                  return (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedRule(r)}
                    >
                      <TableCell className="max-w-[280px]">
                        <div className="flex items-start gap-2">
                          <Switch
                            checked={r.status === "active"}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(v) => toggleRule(r.id, v)}
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">{r.name}</div>
                            <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {r.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <CIcon className="h-3 w-3" /> {cat.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <TIcon className="h-3.5 w-3.5 text-primary" />
                          <span className="truncate">{trig.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {r.actions.slice(0, 2).map((a) => (
                            <Badge key={a} variant="secondary" className="text-[10px]">
                              {ACTION_MAP[a].label}
                            </Badge>
                          ))}
                          {r.actions.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{r.actions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusTone(r.status)}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityTone(r.priority)}>
                          {r.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                        {r.createdBy}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                        {new Date(r.lastModifiedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground 2xl:table-cell">
                        {r.lastExecutedAt ? new Date(r.lastExecutedAt).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right font-numeric text-sm">
                        {r.executionCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            runTest(r);
                          }}
                        >
                          <Beaker className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
              <span>
                Page {page} of {pageCount} · {filtered.length} rules
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─── Visualizer ─── */}
        <TabsContent value="visualizer" className="mt-4 space-y-4">
          <Widget
            title="Workflow Visualizer"
            description="Trigger → Condition → Action pipelines. Drag-and-drop editing lands in Module 5.2."
          >
            <div className="space-y-4">
              {rules.map((r) => (
                <RuleFlow key={r.id} rule={r} />
              ))}
            </div>
          </Widget>
        </TabsContent>

        {/* ─── Execution log ─── */}
        <TabsContent value="logs" className="mt-4 space-y-4">
          <Widget
            title="Execution Log"
            description="Every run is captured with duration, retries, and error surface. Log is empty until integrations are wired."
          >
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted">
                  <ActivitySquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="mt-3 text-sm font-medium text-foreground">No executions yet</div>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  Executions will appear here once the automation engine is connected to Evolution API, OpenAI,
                  Meta, Website, Email, or n8n in Module 5.2.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Triggered By</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{new Date(l.triggeredAt).toLocaleString()}</TableCell>
                      <TableCell>{l.ruleName}</TableCell>
                      <TableCell>{l.triggeredBy}</TableCell>
                      <TableCell>{l.durationMs}ms</TableCell>
                      <TableCell>{l.status}</TableCell>
                      <TableCell>{l.retryCount}</TableCell>
                      <TableCell>{l.errorMessage ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Widget>
        </TabsContent>

        {/* ─── Integrations ─── */}
        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Widget
            title="Integration Hooks"
            description="Registered providers for triggers and actions. All hooks are reserved and inactive until Module 5.2."
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {INTEGRATION_HOOKS.map((h) => (
                <div key={h.id} className="rounded-xl border border-border bg-card/50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Plug className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{h.label}</div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {h.id}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-info/30 bg-info/10 text-info">
                      Reserved
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="mb-1 font-semibold uppercase tracking-wider text-muted-foreground">
                        Provides
                      </div>
                      <ul className="space-y-0.5">
                        {h.provides.length === 0 && <li className="text-muted-foreground">—</li>}
                        {h.provides.map((p) => (
                          <li key={p}>{TRIGGER_MAP[p].label}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="mb-1 font-semibold uppercase tracking-wider text-muted-foreground">
                        Consumes
                      </div>
                      <ul className="space-y-0.5">
                        {h.consumes.length === 0 && <li className="text-muted-foreground">—</li>}
                        {h.consumes.map((c) => (
                          <li key={c}>{ACTION_MAP[c].label}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Widget>
        </TabsContent>
      </Tabs>

      {/* Rule detail sheet */}
      <Sheet open={!!selectedRule} onOpenChange={(o) => !o && setSelectedRule(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selectedRule && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusTone(selectedRule.status)}>
                    {selectedRule.status}
                  </Badge>
                  <Badge variant="outline" className={priorityTone(selectedRule.priority)}>
                    {selectedRule.priority}
                  </Badge>
                  {selectedRule.isSystem && (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                      System
                    </Badge>
                  )}
                </div>
                <SheetTitle className="mt-1">{selectedRule.name}</SheetTitle>
                <SheetDescription>{selectedRule.description}</SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-5">
                <RuleFlow rule={selectedRule} expanded />

                <div className="grid grid-cols-2 gap-3">
                  <MiniField label="Delay" value={`${selectedRule.delaySeconds}s`} />
                  <MiniField label="Max Retries" value={String(selectedRule.maxRetries)} />
                  <MiniField label="Timeout" value={`${selectedRule.timeoutSeconds}s`} />
                  <MiniField label="Category" value={CATEGORY_MAP[selectedRule.category].label} />
                  <MiniField label="Executions" value={String(selectedRule.executionCount)} />
                  <MiniField label="Success / Failure" value={`${selectedRule.successCount} / ${selectedRule.failureCount}`} />
                </div>

                <Widget title="Conditions" description="All conditions must pass for the pipeline to fire.">
                  {selectedRule.conditions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No conditions — trigger fires unconditionally.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {selectedRule.conditions.map((c, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 rounded-md border border-border/70 bg-card/50 px-3 py-1.5 text-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          {formatCondition(c)}
                        </li>
                      ))}
                    </ul>
                  )}
                </Widget>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => runTest(selectedRule)}>
                    <FlaskConical className="mr-1.5 h-4 w-4" /> Test Rule
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Settings2 className="mr-1.5 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant={selectedRule.status === "active" ? "outline" : "default"}
                    className="flex-1"
                    onClick={() => toggleRule(selectedRule.id, selectedRule.status !== "active")}
                  >
                    <Power className="mr-1.5 h-4 w-4" />
                    {selectedRule.status === "active" ? "Pause" : "Activate"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Test / dry-run dialog */}
      <Dialog open={!!testRule} onOpenChange={(o) => !o && setTestRule(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" /> Dry-run · {testRule?.name}
            </DialogTitle>
            <DialogDescription>
              Simulated execution with no external side-effects. All integrations remain reserved.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 min-h-[180px] rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-foreground">
            {testRunning ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running dry-run…
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{testOutput}</pre>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestRule(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New rule builder (skeleton) */}
      <Dialog open={newRuleOpen} onOpenChange={setNewRuleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> New Automation Rule
            </DialogTitle>
            <DialogDescription>
              Define name, trigger, conditions, actions, and delivery policy. Drag-and-drop editor arrives in Module 5.2.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Rule Name</Label>
                <Input placeholder="e.g. GCC WhatsApp lead → auto-assign to Sara" className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input placeholder="What does this rule do?" className="mt-1.5" />
              </div>
              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Normal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Trigger</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label} · {t.source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Primary Action</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.label} · {a.target}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delay (seconds)</Label>
                <Input type="number" defaultValue={0} className="mt-1.5" />
              </div>
              <div>
                <Label>Max Retries</Label>
                <Input type="number" defaultValue={3} className="mt-1.5" />
              </div>
              <div>
                <Label>Timeout (seconds)</Label>
                <Input type="number" defaultValue={30} className="mt-1.5" />
              </div>
              <div className="flex items-end">
                <div className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-sm">Activate on save</span>
                  <Switch />
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="rounded-md border border-info/30 bg-info/5 p-3 text-xs text-info">
            <div className="flex items-start gap-1.5">
              <Info className="mt-0.5 h-3.5 w-3.5" />
              This builder captures the rule contract. Rule persistence and execution ship with Module 5.2.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRuleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Rule captured (draft) — persistence lands in Module 5.2");
                setNewRuleOpen(false);
              }}
            >
              Save as Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

function CategoryChip({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/50 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function RuleFlow({ rule, expanded = false }: { rule: AutomationRule; expanded?: boolean }) {
  const trig = TRIGGER_MAP[rule.trigger];
  const TIcon = trig.icon;
  const cat = CATEGORY_MAP[rule.category];

  const nodes = [
    { kind: "trigger" as const, label: trig.label, sub: trig.source, icon: TIcon, tone: "primary" as const },
    ...(rule.conditions.length > 0
      ? [
          {
            kind: "condition" as const,
            label: `${rule.conditions.length} condition${rule.conditions.length > 1 ? "s" : ""}`,
            sub: rule.conditions[0] ? formatCondition(rule.conditions[0]) : "",
            icon: AlertTriangle,
            tone: "warning" as const,
          },
        ]
      : []),
    ...rule.actions.map((a) => ({
      kind: "action" as const,
      label: ACTION_MAP[a].label,
      sub: ACTION_MAP[a].target,
      icon: ACTION_MAP[a].icon,
      tone: "info" as const,
    })),
    { kind: "end" as const, label: "End", sub: "", icon: CheckCircle2, tone: "success" as const },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/40 p-3",
        expanded && "border-primary/20 bg-primary/[0.03]",
      )}
    >
      {!expanded && (
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Badge variant="outline" className="text-[10px]">
              {cat.label}
            </Badge>
            {rule.name}
          </div>
          <Badge variant="outline" className={statusTone(rule.status)}>
            {rule.status}
          </Badge>
        </div>
      )}
      <ScrollArea>
        <div className="flex min-w-full items-stretch gap-2 pb-1">
          {nodes.map((n, i) => {
            const Icon = n.icon;
            const toneMap = {
              primary: "border-primary/30 bg-primary/10 text-primary",
              info: "border-info/30 bg-info/10 text-info",
              warning: "border-warning/30 bg-warning/10 text-warning",
              success: "border-success/30 bg-success/10 text-success",
            } as const;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={cn(
                    "min-w-[160px] rounded-lg border p-2.5",
                    toneMap[n.tone],
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                      {n.kind}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-sm font-medium">{n.label}</div>
                  {n.sub && <div className="truncate text-[11px] opacity-70">{n.sub}</div>}
                </div>
                {i < nodes.length - 1 && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
