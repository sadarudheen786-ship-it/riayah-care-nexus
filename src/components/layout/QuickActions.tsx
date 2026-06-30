import {
  Plus,
  UserPlus,
  Upload,
  FileText,
  Building2,
  Receipt,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACTIONS = [
  { icon: UserPlus, label: "New Lead" },
  { icon: Upload, label: "Upload Medical Report" },
  { icon: FileText, label: "Generate Proposal" },
  { icon: Building2, label: "Assign Hospital" },
  { icon: Receipt, label: "Create Invoice" },
  { icon: MessageCircle, label: "Open WhatsApp" },
];

export function QuickActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="hidden gap-1.5 sm:inline-flex">
          <Plus className="h-4 w-4" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Create or jump to…</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <DropdownMenuItem key={a.label}>
              <Icon className="mr-2 h-4 w-4 text-primary" />
              {a.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
