import { Bell, AlertTriangle, CheckCircle2, Info, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NOTIFS = [
  {
    icon: AlertTriangle,
    tone: "warning" as const,
    title: "New high-priority lead",
    body: "Patient inquiry from Riyadh awaiting triage.",
    time: "2m ago",
    priority: "High",
  },
  {
    icon: FileText,
    tone: "info" as const,
    title: "Proposal sent",
    body: "Aster Medcity proposal delivered to family.",
    time: "1h ago",
    priority: "Normal",
  },
  {
    icon: CheckCircle2,
    tone: "success" as const,
    title: "Visa approved",
    body: "Patient #RY-2104 visa cleared.",
    time: "Today",
    priority: "Normal",
  },
  {
    icon: Info,
    tone: "info" as const,
    title: "Hospital opinion received",
    body: "Dr. Suresh shared a second opinion.",
    time: "Yesterday",
    priority: "Low",
  },
];

const toneClasses: Record<string, string> = {
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
};

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  High: "destructive",
  Normal: "secondary",
  Low: "outline",
};

export function NotificationsMenu() {
  const unread = NOTIFS.length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="font-display text-sm font-semibold">Notifications</div>
            <div className="text-xs text-muted-foreground">{unread} unread</div>
          </div>
          <button className="text-xs font-medium text-primary hover:underline">
            Mark all read
          </button>
        </div>
        <ScrollArea className="max-h-[420px]">
          <ul className="divide-y divide-border">
            {NOTIFS.map((n, i) => {
              const Icon = n.icon;
              return (
                <li
                  key={i}
                  className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                      toneClasses[n.tone],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-medium text-foreground">
                        {n.title}
                      </div>
                      <Badge
                        variant={priorityVariant[n.priority]}
                        className="h-4 shrink-0 px-1.5 text-[10px]"
                      >
                        {n.priority}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {n.body}
                    </p>
                    <div className="mt-1 text-[11px] text-muted-foreground">{n.time}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
        <div className="border-t border-border px-4 py-2 text-center">
          <button className="text-xs font-medium text-primary hover:underline">
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
