import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radar,
  UserPlus,
  Users,
  Brain,
  Activity,
  Building2,
  Stethoscope,
  MessageSquareQuote,
  FileText,
  CalendarClock,
  Wallet,
  BarChart3,
  Files,
  MessagesSquare,
  ShieldCheck,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  group: "Workspace" | "Intelligence" | "Operations" | "System";
}

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, group: "Workspace" },
  { label: "Executive Command Center", to: "/command-center", icon: Radar, group: "Workspace" },
  { label: "Lead Management", to: "/leads", icon: UserPlus, group: "Workspace" },
  { label: "Patients", to: "/patients", icon: Users, group: "Workspace" },

  { label: "Medical Intelligence", to: "/medical-intelligence", icon: Brain, group: "Intelligence" },
  { label: "Disease Engine", to: "/disease-engine", icon: Activity, group: "Intelligence" },
  { label: "Hospitals", to: "/hospitals", icon: Building2, group: "Intelligence" },
  { label: "Doctors", to: "/doctors", icon: Stethoscope, group: "Intelligence" },
  { label: "Hospital Opinions", to: "/hospital-opinions", icon: MessageSquareQuote, group: "Intelligence" },

  { label: "Proposal Center", to: "/proposals", icon: FileText, group: "Operations" },
  { label: "Follow-ups", to: "/follow-ups", icon: CalendarClock, group: "Operations" },
  { label: "Finance", to: "/finance", icon: Wallet, group: "Operations" },
  { label: "Reports", to: "/reports", icon: BarChart3, group: "Operations" },
  { label: "Documents", to: "/documents", icon: Files, group: "Operations" },
  { label: "Communication", to: "/communication", icon: MessagesSquare, group: "Operations" },

  { label: "Administration", to: "/administration", icon: ShieldCheck, group: "System" },
  { label: "Settings", to: "/settings", icon: Settings, group: "System" },
];

const GROUPS: NavItem["group"][] = ["Workspace", "Intelligence", "Operations", "System"];

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* mobile overlay */}
      <div
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width,transform] duration-300 ease-out",
          "w-[264px]",
          collapsed && "lg:w-[76px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex h-16 items-center gap-3 border-b border-sidebar-border px-4",
            collapsed && "lg:justify-center lg:px-2",
          )}
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            <span className="font-display text-base font-bold">R</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-[15px] font-semibold leading-tight text-sidebar-foreground">
                RiayahOS
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                Healthcare Intelligence Platform
              </div>
            </div>
          )}
          <button
            onClick={onMobileClose}
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1">
          <nav className="px-2 py-4">
            {GROUPS.map((group) => {
              const items = NAV.filter((n) => n.group === group);
              return (
                <div key={group} className="mb-4">
                  {!collapsed && (
                    <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {group}
                    </div>
                  )}
                  <ul className="space-y-0.5">
                    {items.map((item) => {
                      const active =
                        item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                      const Icon = item.icon;
                      return (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            onClick={onMobileClose}
                            className={cn(
                              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                              "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              active &&
                                "bg-sidebar-accent text-sidebar-primary shadow-sm",
                              collapsed && "lg:justify-center lg:px-2",
                            )}
                            title={collapsed ? item.label : undefined}
                          >
                            {active && (
                              <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                            )}
                            <Icon
                              className={cn(
                                "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110",
                                active ? "text-sidebar-primary" : "text-muted-foreground",
                              )}
                            />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          {collapsed ? (
            <div
              className="mx-auto h-2 w-2 rounded-full bg-success animate-pulse"
              title="All systems operational"
              aria-label="All systems operational"
            />
          ) : (
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-semibold text-sidebar-foreground">
                  RiayahOS
                </span>
                <span className="font-numeric text-[10px] text-muted-foreground">
                  v1.0
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] font-medium text-sidebar-foreground">
                  All systems operational
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
