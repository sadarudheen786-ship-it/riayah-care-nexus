/**
 * Reusable Intelligent Workflow Engine components.
 *
 * These components are pure UI — they receive a `WorkflowState` plus optional
 * callbacks and render the operational surface (summary panel, stage stepper,
 * checklists, SLA board). Any module (Case Workspace, Lead detail, Command
 * Center) can compose them without duplicating workflow logic.
 */

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  FileCheck2,
  Flag,
  ListChecks,
  Lock,
  Sparkles,
  Timer,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { Widget } from "@/components/common/Widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CLINICAL_PATHS,
  STAGE_MAP,
  WORKFLOW_STAGES,
  computeSlaStatus,
  computePipelineHours,
  formatSlaLabel,
  getNextStage,
  getPathStages,
  getPreviousStage,
  getStageIndex,
  validateAdvance,
  type ClinicalPathId,
  type WorkflowState,
  type SlaStatus,
} from "@/lib/workflow";

const SLA_TONE: Record<SlaStatus, { label: string; className: string; dot: string }> = {
  on_track: {
    label: "On track",
    className: "border-success/30 bg-success/10 text-success",
    dot: "bg-success",
  },
  due_soon: {
    label: "Due soon",
    className: "border-warning/30 bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  overdue: {
    label: "Overdue",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  not_started: {
    label: "Not started",
    className: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

// ────────────────────────────────────────────────────────────────
// Executive Workflow Summary panel
// ────────────────────────────────────────────────────────────────

export interface WorkflowSummaryProps {
  state: WorkflowState;
  caseHealth?: { label: string; score: number };
  revenueProbability?: number;
  expectedRevenueInr?: number;
  onOpenEngine?: () => void;
}

export function WorkflowSummaryPanel({
  state,
  caseHealth,
  revenueProbability,
  expectedRevenueInr,
  onOpenEngine,
}: WorkflowSummaryProps) {
  const stage = STAGE_MAP[state.currentStageId];
  const prev = getPreviousStage(state);
  const next = getNextStage(state);
  const progress = state.progress[state.currentStageId];
  const sla = computeSlaStatus(stage, progress);
  const slaTone = SLA_TONE[sla.status];
  const waitingHours = progress?.waitingHours ?? 0;
  const pipelineHours = computePipelineHours(state);
  const validation = validateAdvance(state);

  return (
    <Widget
      title="Workflow Summary"
      description={CLINICAL_PATHS[state.pathId].label}
      actions={
        onOpenEngine && (
          <Button variant="ghost" size="sm" onClick={onOpenEngine}>
            <Workflow className="mr-1.5 h-4 w-4" /> Open engine
          </Button>
        )
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <SummaryTile
          icon={Flag}
          label="Current stage"
          value={stage.name}
          hint={stage.category}
          tone="primary"
        />
        <SummaryTile
          icon={ChevronRight}
          label="Next stage"
          value={next?.name ?? "Case Completed"}
          hint={next ? `SLA ${next.slaHours}h` : "End of path"}
          tone="info"
        />
        <SummaryTile
          icon={Clock}
          label="Previous stage"
          value={prev?.name ?? "—"}
          hint={prev ? "Completed" : "First stage"}
        />
        <SummaryTile
          icon={Timer}
          label="Waiting in stage"
          value={`${waitingHours.toFixed(1)}h`}
          hint={`${formatSlaLabel(sla.remainingHours)} ${sla.status === "overdue" ? "overdue" : "remaining"}`}
          tone={sla.status === "overdue" ? "danger" : sla.status === "due_soon" ? "warning" : "success"}
        />
        <SummaryTile
          icon={TrendingUp}
          label="Time in pipeline"
          value={`${(pipelineHours / 24).toFixed(1)} d`}
          hint={`${pipelineHours.toFixed(0)} hours total`}
        />
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-card/50 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            SLA status
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", slaTone.dot)} />
            <span className="text-sm font-medium text-foreground">{slaTone.label}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            SLA {stage.slaHours}h · {formatSlaLabel(sla.remainingHours)}{" "}
            {sla.status === "overdue" ? "overdue" : "remaining"}
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/50 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Case health · Revenue probability
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">
              {caseHealth ? `${caseHealth.label} · ${caseHealth.score}` : "—"}
            </span>
            <span className="font-numeric text-sm font-semibold text-primary">
              {revenueProbability != null ? `${revenueProbability}%` : "—"}
            </span>
          </div>
          {expectedRevenueInr != null && (
            <div className="mt-1 text-xs text-muted-foreground">
              Expected revenue ₹{new Intl.NumberFormat("en-IN").format(expectedRevenueInr)}
            </div>
          )}
        </div>
        <div className="rounded-lg border border-primary/25 bg-primary/[0.06] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Next best action
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">{stage.nextBestAction}</div>
          {!validation.canAdvance && validation.blockers[0] && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> {validation.blockers[0]}
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "muted",
}: {
  icon: typeof Flag;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "info" | "success" | "warning" | "danger" | "muted";
}) {
  const toneMap = {
    primary: "text-primary",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
    muted: "text-muted-foreground",
  } as const;
  return (
    <div className="rounded-lg border border-border/70 bg-card/50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", toneMap[tone])} />
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-foreground">{value}</div>
      {hint && <div className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Full engine view (stepper + checklists + validation + advance)
// ────────────────────────────────────────────────────────────────

export interface WorkflowEngineViewProps {
  state: WorkflowState;
  onPathChange?: (pathId: ClinicalPathId) => void;
  onAdvance?: () => void;
  onToggleTask?: (task: string) => void;
  onUploadDocument?: (doc: string) => void;
}

export function WorkflowEngineView({
  state,
  onPathChange,
  onAdvance,
  onToggleTask,
  onUploadDocument,
}: WorkflowEngineViewProps) {
  const pathStages = getPathStages(state.pathId);
  const currentIdx = getStageIndex(state);
  const stage = STAGE_MAP[state.currentStageId];
  const next = getNextStage(state);
  const validation = validateAdvance(state);
  const progress = state.progress[state.currentStageId];
  const sla = computeSlaStatus(stage, progress);
  const slaTone = SLA_TONE[sla.status];
  const completion = pathStages.length > 0 ? ((currentIdx + 1) / pathStages.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Clinical path switcher */}
      <Widget
        title="Clinical Path"
        description="Workflow adapts to the treatment journey. Optional stages can be skipped."
        actions={
          <div className="flex flex-wrap gap-1.5">
            {Object.values(CLINICAL_PATHS).map((p) => (
              <Button
                key={p.id}
                variant={state.pathId === p.id ? "default" : "outline"}
                size="sm"
                onClick={() => onPathChange?.(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        }
      >
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Stage {currentIdx + 1} of {pathStages.length} · {stage.name}
          </span>
          <span className="font-numeric">{Math.round(completion)}% through path</span>
        </div>
        <Progress value={completion} className="h-2" />
      </Widget>

      {/* Stage stepper */}
      <Widget title="Workflow Stages" description="Click a completed stage to review its record.">
        <ScrollArea>
          <ol className="flex min-w-full gap-2 pb-1">
            {pathStages.map((s, i) => {
              const status =
                i < currentIdx ? "complete" : i === currentIdx ? "current" : "future";
              const StageIcon = s.icon;
              return (
                <li
                  key={s.id}
                  className={cn(
                    "surface-card flex min-w-[190px] flex-1 flex-col gap-1 p-3 transition-all",
                    status === "current" && "ring-2 ring-primary/60",
                    status === "complete" && "opacity-90",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                      {s.optional && (
                        <Badge variant="outline" className="h-4 px-1 text-[9px]">
                          optional
                        </Badge>
                      )}
                    </span>
                    {status === "complete" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : status === "current" ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StageIcon className="h-4 w-4 text-primary" />
                    <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">SLA {s.slaHours}h</span>
                </li>
              );
            })}
          </ol>
        </ScrollArea>
      </Widget>

      {/* Current stage detail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Widget
          title={`Required documents · ${stage.name}`}
          description="Automatically checked against the case document repository."
        >
          {stage.requiredDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents required at this stage.</p>
          ) : (
            <ul className="space-y-2">
              {stage.requiredDocuments.map((doc) => {
                const uploaded = progress?.uploadedDocuments?.includes(doc) ?? false;
                return (
                  <li
                    key={doc}
                    className="flex items-center justify-between rounded-md border border-border/70 bg-card/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck2
                        className={cn("h-4 w-4", uploaded ? "text-success" : "text-muted-foreground")}
                      />
                      <span className="text-sm text-foreground">{doc}</span>
                    </div>
                    {uploaded ? (
                      <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                        Uploaded
                      </Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => onUploadDocument?.(doc)}>
                        Upload
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Widget>

        <Widget
          title={`Stage checklist · ${stage.name}`}
          description="Tasks are auto-generated when the stage is entered."
        >
          <ul className="space-y-2">
            {stage.requiredTasks.map((task) => {
              const done = progress?.completedTasks?.includes(task) ?? false;
              return (
                <li
                  key={task}
                  className="flex items-center justify-between rounded-md border border-border/70 bg-card/50 px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => onToggleTask?.(task)}
                    className="flex items-center gap-2 text-left"
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        done ? "text-muted-foreground line-through" : "text-foreground",
                      )}
                    >
                      {task}
                    </span>
                  </button>
                  <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                </li>
              );
            })}
          </ul>
        </Widget>
      </div>

      {/* SLA + advance */}
      <Widget
        title="Stage Validation"
        description="Advance is blocked until every requirement is satisfied."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline" className={slaTone.className}>
                <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", slaTone.dot)} />
                SLA {slaTone.label}
              </Badge>
              <span className="text-muted-foreground">
                {formatSlaLabel(sla.remainingHours)}{" "}
                {sla.status === "overdue" ? "overdue" : "remaining"} · SLA {stage.slaHours}h
              </span>
            </div>
            {validation.blockers.length === 0 ? (
              <p className="text-sm text-success">
                All requirements satisfied. Ready to move to {next?.name ?? "Case Completed"}.
              </p>
            ) : (
              <ul className="space-y-1 text-sm text-warning">
                {validation.blockers.map((b) => (
                  <li key={b} className="flex items-start gap-1.5">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <Button onClick={onAdvance} disabled={!validation.canAdvance || !next}>
              {validation.canAdvance ? (
                <>
                  Advance to {next?.name ?? "Complete"} <ChevronRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  <Lock className="mr-1.5 h-4 w-4" /> Advance blocked
                </>
              )}
            </Button>
            <span className="text-[11px] text-muted-foreground">
              Advancing recomputes health, forecast & dashboards.
            </span>
          </div>
        </div>
      </Widget>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// SLA board — pipeline-wide overview for Lead Management
// ────────────────────────────────────────────────────────────────

export interface WorkflowBoardMetric {
  stageId: string;
  count: number;
  overdue: number;
}

export function WorkflowStageBoard({ metrics }: { metrics: WorkflowBoardMetric[] }) {
  const rows = useMemo(() => {
    return WORKFLOW_STAGES.map((s) => {
      const m = metrics.find((x) => x.stageId === s.id);
      return { stage: s, count: m?.count ?? 0, overdue: m?.overdue ?? 0 };
    }).filter((r) => r.count > 0 || r.overdue > 0);
  }, [metrics]);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active workflow stages to display. Metrics will appear once cases enter the pipeline.
      </p>
    );
  }

  return (
    <ScrollArea>
      <div className="flex min-w-full gap-2 pb-1">
        {rows.map(({ stage, count, overdue }) => {
          const Icon = stage.icon;
          return (
            <div key={stage.id} className="surface-card min-w-[170px] flex-1 p-3">
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-numeric text-lg font-semibold text-foreground">{count}</span>
              </div>
              <div className="mt-1 truncate text-xs font-medium text-foreground">{stage.name}</div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>SLA {stage.slaHours}h</span>
                {overdue > 0 ? (
                  <span className="inline-flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {overdue} overdue
                  </span>
                ) : (
                  <span className="text-success">On track</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// ────────────────────────────────────────────────────────────────
// Playground state hook — for demo integration
// ────────────────────────────────────────────────────────────────

export function useDemoWorkflowState(initial: WorkflowState) {
  const [state, setState] = useState<WorkflowState>(initial);

  const toggleTask = (task: string) => {
    setState((s) => {
      const p = s.progress[s.currentStageId] ?? { stageId: s.currentStageId, status: "in_progress" };
      const done = new Set(p.completedTasks ?? []);
      done.has(task) ? done.delete(task) : done.add(task);
      return {
        ...s,
        progress: {
          ...s.progress,
          [s.currentStageId]: { ...p, completedTasks: Array.from(done) },
        },
      };
    });
  };

  const uploadDocument = (doc: string) => {
    setState((s) => {
      const p = s.progress[s.currentStageId] ?? { stageId: s.currentStageId, status: "in_progress" };
      const docs = new Set(p.uploadedDocuments ?? []);
      docs.add(doc);
      return {
        ...s,
        progress: {
          ...s.progress,
          [s.currentStageId]: { ...p, uploadedDocuments: Array.from(docs) },
        },
      };
    });
  };

  const advance = () => {
    setState((s) => {
      const next = getNextStage(s);
      if (!next) return s;
      const nowIso = new Date().toISOString();
      const current = s.progress[s.currentStageId] ?? {
        stageId: s.currentStageId,
        status: "in_progress" as const,
      };
      return {
        ...s,
        currentStageId: next.id,
        progress: {
          ...s.progress,
          [s.currentStageId]: { ...current, status: "complete", exitDate: nowIso },
          [next.id]: {
            stageId: next.id,
            status: "in_progress",
            entryDate: nowIso,
            waitingHours: 0,
          },
        },
      };
    });
  };

  const setPath = (pathId: ClinicalPathId) => setState((s) => ({ ...s, pathId }));

  return { state, toggleTask, uploadDocument, advance, setPath };
}
