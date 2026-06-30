import { useMemo, useState } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  FileText,
  Stethoscope,
  Wallet,
  Activity as ActivityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Category = "Urgent" | "Medical" | "Operations" | "Finance";

interface Notif {
  icon: typeof Bell;
  tone: "warning" | "info" | "success" | "danger";
  title: string;
  body: string;
  time: string;
  priority: "High" | "Normal" | "Low";
  category: Category;
}

const NOTIFS: Notif[] = [
  {
    icon: AlertTriangle,
    tone: "danger",
    title: "Critical case awaiting triage",
    body: "Riyadh lead — cardiology, flagged as urgent.",
    time: "2m ago",
    priority: "High",
    category: "Urgent",
  },
  {
    icon: Stethoscope,
    tone: "info",
    title: "Hospital opinion received",
    body: "Dr. Suresh shared a second opinion for case RY-2104.",
    time: "1h ago",
    priority: "Normal",
    category: "Medical",
  },
  {
    icon: FileText,
    tone: "info",
    title: "Proposal delivered",
    body: "Aster Medcity proposal sent to the Al-Mansoori family.",
    time: "3h ago",
    priority: "Normal",
    category: "Operations",
  },
  {
    icon: CheckCircle2,
    tone: "success",
    title: "Visa approved",
    body: "Patient RY-2104 visa cleared — travel can be planned.",
    time: "Today",
    priority: "Normal",
    category: "Operations",
  },
  {
    icon: Wallet,
    tone: "success",
    title: "Payment received",
    body: "AED 18,500 received against invoice INV-1042.",
    time: "Today",
    priority: "Normal",
    category: "Finance",
  },
  {
    icon: Info,
    tone: "info",
    title: "MRI uploaded",
    body: "Patient family uploaded brain MRI for review.",
    time: "Yesterday",
    priority: "Low",
    category: "Medical",
  },
];

const TONE: Record<Notif["tone"], string> = {
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
};

const PRIORITY: Record<Notif["priority"], string> = {
  High: "bg-destructive/10 text-destructive",
  Normal: "bg-muted text-muted-foreground",
  Low: "bg-muted/60 text-muted-foreground",
};

const TABS: Array<"All" | Category> = ["All", "Urgent", "Medical", "Operations", "Finance"];

export function NotificationsMenu() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const unread = NOTIFS.length;

  const filtered = useMemo(
    () => (tab === "All" ? NOTIFS : NOTIFS.filter((n) => n.category === tab)),
    [tab],
  );

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
      <PopoverContent align="end" className="w-[400px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="font-display text-sm font-semibold">Notifications</div>
            <div className="text-xs text-muted-foreground">{unread} unread</div>
          </div>
          <button className="text-xs font-medium text-primary hover:underline">
            Mark all read
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                tab === t
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <ScrollArea className="max-h-[420px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <ActivityIcon className="h-6 w-6 text-muted-foreground" />
              <div className="text-sm font-medium text-foreground">You're all caught up</div>
              <div className="text-xs text-muted-foreground">
                No {tab.toLowerCase()} alerts right now.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((n, i) => {
                const Icon = n.icon;
                return (
                  <li
                    key={i}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                        TONE[n.tone],
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
                          variant="outline"
                          className={cn("h-4 shrink-0 border-0 px-1.5 text-[10px]", PRIORITY[n.priority])}
                        >
                          {n.priority}
                        </Badge>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{n.category}</span>
                        <span>·</span>
                        <span>{n.time}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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
