import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: { value: string; trend: "up" | "down" | "flat" };
  icon?: LucideIcon;
  hint?: string;
  tone?: "primary" | "accent" | "info" | "success" | "warning";
}

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent-foreground",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

export function StatCard({ label, value, delta, icon: Icon, hint, tone = "primary" }: Props) {
  return (
    <div className="surface-card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-numeric text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </div>
        </div>
        {Icon && (
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
              toneClasses[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(delta || hint) && (
        <div className="mt-4 flex items-center justify-between text-xs">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold",
                delta.trend === "up"
                  ? "bg-success/10 text-success"
                  : delta.trend === "down"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {delta.trend === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : delta.trend === "down" ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : null}
              {delta.value}
            </span>
          ) : (
            <span />
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}
