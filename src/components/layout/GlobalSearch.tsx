import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Users,
  UserPlus,
  Stethoscope,
  Building2,
  Activity,
  BarChart3,
  Wallet,
  Files,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const SECTIONS = [
  {
    heading: "Navigate",
    items: [
      { icon: Users, label: "Patients", to: "/patients" },
      { icon: UserPlus, label: "Leads", to: "/leads" },
      { icon: Stethoscope, label: "Doctors", to: "/doctors" },
      { icon: Building2, label: "Hospitals", to: "/hospitals" },
      { icon: Activity, label: "Disease Engine", to: "/disease-engine" },
      { icon: BarChart3, label: "Reports", to: "/reports" },
      { icon: Wallet, label: "Invoices", to: "/finance" },
      { icon: Files, label: "Documents", to: "/documents" },
    ],
  },
] as const;

export function GlobalSearch({ open, onOpenChange }: Props) {
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search patients, leads, doctors, hospitals, diseases, reports…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {SECTIONS.map((section, idx) => (
          <div key={section.heading}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={section.heading}>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.to}
                    value={item.label}
                    onSelect={() => go(item.to)}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
