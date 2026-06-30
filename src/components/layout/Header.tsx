import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Settings,
  Sun,
  LifeBuoy,
  Globe,
  Command as CommandIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme/ThemeProvider";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsMenu } from "./NotificationsMenu";
import { QuickActions } from "./QuickActions";
import { cn } from "@/lib/utils";

interface Props {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
}

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Header({ collapsed, onToggleSidebar, onOpenMobile }: Props) {
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "AR">("EN");
  // Avoid SSR/CSR mismatch: render time-derived strings only after mount.
  const [now, setNow] = useState<Date | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    setLastSync(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const greet = now ? greetingFor(now.getHours()) : "Welcome";
  const dateStr = now
    ? now.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  const syncStr = lastSync
    ? lastSync.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobile}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        <div className="hidden min-w-0 md:block">
          <div className="font-display text-[15px] font-semibold leading-tight text-foreground">
            {greet}, Sadarudheen
          </div>
          <div className="text-xs text-muted-foreground">
            Riayah Care Operations Dashboard
          </div>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setSearchOpen(true)}
          className={cn(
            "group hidden h-10 items-center gap-2 rounded-xl border border-border bg-background/60 px-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-background md:flex md:w-[300px] lg:w-[380px]",
          )}
          aria-label="Open command search"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate">
            Search patients, cases, hospitals, doctors, reports…
          </span>
          <kbd className="hidden items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-flex">
            <CommandIcon className="h-3 w-3" />K
          </kbd>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Date + last sync */}
        <div className="hidden h-10 items-center gap-3 rounded-xl border border-border bg-background/60 px-3 text-xs font-medium text-muted-foreground xl:flex">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="font-numeric" suppressHydrationWarning>
              {dateStr || "—"}
            </span>
          </span>
          <span className="h-3 w-px bg-border" />
          <span
            className="inline-flex items-center gap-1.5"
            title="Last data sync"
            suppressHydrationWarning
          >
            <RefreshCw className="h-3.5 w-3.5 text-success" />
            <span className="font-numeric">Synced {syncStr || "—"}</span>
          </span>
        </div>

        <QuickActions />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLang((l) => (l === "EN" ? "AR" : "EN"))}
          aria-label="Switch language"
          className="relative"
        >
          <Globe className="h-5 w-5" />
          <span className="absolute -bottom-0.5 -right-0.5 rounded-md bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {lang}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <NotificationsMenu />

        <Separator orientation="vertical" className="mx-1 h-8" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-muted focus-ring"
              aria-label="Profile menu"
            >
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary text-primary-foreground font-display font-semibold text-sm">
                  SD
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <div className="text-[13px] font-semibold leading-tight text-foreground">
                  Sadarudheen
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    CEO
                  </Badge>
                </div>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="text-sm font-semibold">Sadarudheen</div>
              <div className="text-xs font-normal text-muted-foreground">
                ceo@riayahcare.com
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" /> Support
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
