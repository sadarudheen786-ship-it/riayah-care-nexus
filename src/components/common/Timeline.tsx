import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  icon: LucideIcon;
  title: string;
  description?: string;
  time: string;
  tone?: "primary" | "info" | "success" | "warning" | "danger";
}

const toneClasses: Record<NonNullable<TimelineItem["tone"]>, string> = {
  primary: "bg-primary/10 text-primary ring-primary/20",
  info: "bg-info/10 text-info ring-info/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  danger: "bg-destructive/10 text-destructive ring-destructive/20",
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-5 pl-2">
      <span className="absolute left-[18px] top-2 bottom-2 w-px bg-border" aria-hidden />
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <li key={i} className="relative flex gap-3">
            <div
              className={cn(
                "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-surface",
                toneClasses[item.tone ?? "primary"],
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {item.time}
                </span>
              </div>
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
