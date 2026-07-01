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
  FileText,
  Receipt,
  MessageSquareQuote,
  Radar,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const SECTIONS = [
  {
    heading: "Cases & People",
    items: [
      { icon: Users, label: "Patients", to: "/patients" },
      { icon: UserPlus, label: "Leads", to: "/leads" },
      { icon: Stethoscope, label: "Doctors", to: "/doctors" },
      { icon: Building2, label: "Hospitals", to: "/hospitals" },
    ],
  },
  {
    heading: "Medical",
    items: [
      { icon: Activity, label: "Diseases", to: "/disease-engine" },
      { icon: MessageSquareQuote, label: "Hospital Opinions", to: "/hospital-opinions" },
      { icon: FileText, label: "Proposals", to: "/proposals" },
    ],
  },
  {
    heading: "Finance & Reports",
    items: [
      { icon: Wallet, label: "Finance", to: "/finance" },
      { icon: Receipt, label: "Invoices", to: "/finance" },
      { icon: BarChart3, label: "Reports", to: "/reports" },
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
      <CommandInput placeholder="Search patients, cases, hospitals, doctors, reports…" />
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
                    key={`${section.heading}-${item.label}`}
                    value={`${section.heading} ${item.label}`}
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
