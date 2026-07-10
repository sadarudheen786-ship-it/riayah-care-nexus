import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Settings2,
  Building2,
  Sparkles,
  MessageCircle,
  Facebook,
  Brain,
  Workflow,
  Mail,
  Globe,
  Bell,
  ShieldCheck,
  DatabaseBackup,
  ScrollText,
  Save,
  RotateCcw,
  X,
  Eye,
  EyeOff,
  PlugZap,
  Unplug,
  TestTube2,
  Upload,
  KeyRound,
  Copy,
  ShieldAlert,
  Info,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/administration")({
  head: () => ({
    meta: [
      { title: "System Administration — RiayahOS" },
      {
        name: "description",
        content:
          "Central configuration center for RiayahOS — company, AI, integrations, security and enterprise controls.",
      },
    ],
  }),
  component: SystemAdministration,
});

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type SectionId =
  | "general"
  | "company"
  | "ai"
  | "whatsapp"
  | "meta"
  | "openai"
  | "n8n"
  | "email"
  | "website"
  | "notifications"
  | "security"
  | "backup"
  | "audit";

interface Section {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  group: "Platform" | "Intelligence" | "Integrations" | "Governance";
  description: string;
}

const SECTIONS: Section[] = [
  { id: "general", label: "General", icon: Settings2, group: "Platform", description: "System-wide preferences" },
  { id: "company", label: "Company", icon: Building2, group: "Platform", description: "Organization profile" },
  { id: "ai", label: "AI Configuration", icon: Sparkles, group: "Intelligence", description: "Model & feature toggles" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, group: "Integrations", description: "Evolution API" },
  { id: "meta", label: "Meta Business", icon: Facebook, group: "Integrations", description: "Meta / WhatsApp / IG" },
  { id: "openai", label: "OpenAI", icon: Brain, group: "Integrations", description: "OpenAI API" },
  { id: "n8n", label: "n8n Automation", icon: Workflow, group: "Integrations", description: "Workflow automation" },
  { id: "email", label: "Email (SMTP)", icon: Mail, group: "Integrations", description: "Transactional email" },
  { id: "website", label: "Website API", icon: Globe, group: "Integrations", description: "Inbound leads" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Governance", description: "Alert channels" },
  { id: "security", label: "Security", icon: ShieldCheck, group: "Governance", description: "Access & policies" },
  { id: "backup", label: "Backup & Recovery", icon: DatabaseBackup, group: "Governance", description: "Data protection" },
  { id: "audit", label: "Audit Logs", icon: ScrollText, group: "Governance", description: "Configuration history" },
];

const GROUPS: Section["group"][] = ["Platform", "Intelligence", "Integrations", "Governance"];

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

type Status = "connected" | "disconnected" | "pending" | "degraded";

const STATUS: Record<Status, { label: string; dot: string; chip: string }> = {
  connected: {
    label: "Connected",
    dot: "bg-success",
    chip: "bg-success/10 text-success border-success/20",
  },
  disconnected: {
    label: "Not Connected",
    dot: "bg-muted-foreground/40",
    chip: "bg-muted text-muted-foreground border-border",
  },
  pending: {
    label: "Pending",
    dot: "bg-warning",
    chip: "bg-warning/10 text-warning border-warning/20",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-destructive",
    chip: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function StatusChip({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        s.chip,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SecretInput({
  id,
  placeholder,
  hasValue,
}: {
  id: string;
  placeholder?: string;
  hasValue?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  const masked = hasValue && !value;
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={masked ? "••••••••••••••••" : placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pr-20 font-mono text-sm"
        autoComplete="off"
      />
      <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-1">
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(value).catch(() => {});
            toast.success("Copied to clipboard");
          }}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
          aria-label="Copy"
          disabled={!value}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {description && (
          <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

function IntegrationMeta({
  status,
  lastTested,
  lastError,
}: {
  status: Status;
  lastTested: string;
  lastError?: string;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 sm:grid-cols-3">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status</div>
        <div className="mt-1"><StatusChip status={status} /></div>
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Last Tested</div>
        <div className="mt-1 text-sm font-medium text-foreground">{lastTested}</div>
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Last Error</div>
        <div className={cn("mt-1 truncate text-sm font-medium", lastError ? "text-destructive" : "text-foreground")}>
          {lastError ?? "—"}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form footer with confirm-save dialog                                */
/* ------------------------------------------------------------------ */

function FormFooter({
  onSave,
  sensitive,
  extra,
}: {
  onSave?: () => void;
  sensitive?: boolean;
  extra?: ReactNode;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSave = () => {
    onSave?.();
    toast.success("Configuration saved");
  };

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <div className="text-xs text-muted-foreground">
          Changes are staged locally until saved. Review carefully before applying.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {extra}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toast("Changes discarded")}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toast("Reset to defaults")}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => (sensitive ? setConfirmOpen(true) : handleSave())}
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save Changes
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" />
              Confirm configuration change
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update sensitive system configuration. This action will be
              logged in the audit trail and may impact live integrations. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>Confirm & Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function GeneralSection() {
  const [maintenance, setMaintenance] = useState(false);
  return (
    <SectionCard
      title="General Settings"
      description="System-wide preferences applied across all RiayahOS modules."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="System Name" htmlFor="sys-name">
          <Input id="sys-name" defaultValue="RiayahOS" />
        </Field>
        <Field label="Company Time Zone" htmlFor="tz">
          <Select defaultValue="Asia/Kolkata">
            <SelectTrigger id="tz"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
              <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
              <SelectItem value="Asia/Riyadh">Asia/Riyadh (AST)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Default Currency" htmlFor="cur">
          <Select defaultValue="INR">
            <SelectTrigger id="cur"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR — Indian Rupee</SelectItem>
              <SelectItem value="AED">AED — UAE Dirham</SelectItem>
              <SelectItem value="SAR">SAR — Saudi Riyal</SelectItem>
              <SelectItem value="USD">USD — US Dollar</SelectItem>
              <SelectItem value="EUR">EUR — Euro</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Default Language" htmlFor="lang">
          <Select defaultValue="en">
            <SelectTrigger id="lang"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date Format" htmlFor="datefmt">
          <Select defaultValue="dd-mm-yyyy">
            <SelectTrigger id="datefmt"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
              <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
              <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Number Format" htmlFor="numfmt">
          <Select defaultValue="in">
            <SelectTrigger id="numfmt"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Indian (1,23,456.78)</SelectItem>
              <SelectItem value="intl">International (123,456.78)</SelectItem>
              <SelectItem value="eu">European (123.456,78)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Working Days" htmlFor="days">
          <Select defaultValue="mon-sat">
            <SelectTrigger id="days"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mon-fri">Monday — Friday</SelectItem>
              <SelectItem value="mon-sat">Monday — Saturday</SelectItem>
              <SelectItem value="sun-thu">Sunday — Thursday</SelectItem>
              <SelectItem value="all">All 7 days</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Business Start Day" htmlFor="startday">
          <Select defaultValue="monday">
            <SelectTrigger id="startday"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sunday">Sunday</SelectItem>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Working Hours (Start)" htmlFor="whstart">
          <Input id="whstart" type="time" defaultValue="09:00" />
        </Field>
        <Field label="Working Hours (End)" htmlFor="whend">
          <Input id="whend" type="time" defaultValue="18:00" />
        </Field>
      </div>

      <Separator className="my-6" />

      <div className="flex items-start justify-between gap-4 rounded-xl border border-warning/20 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-warning" />
          <div>
            <div className="text-sm font-semibold text-foreground">Maintenance Mode</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              When enabled, only administrators can access RiayahOS. All other users see a maintenance page.
            </div>
          </div>
        </div>
        <Switch checked={maintenance} onCheckedChange={setMaintenance} />
      </div>

      <FormFooter sensitive />
    </SectionCard>
  );
}

function CompanySection() {
  return (
    <SectionCard
      title="Company Profile"
      description="Organization details used across proposals, invoices, and patient communication."
    >
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
        <div className="grid h-16 w-16 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-xl font-bold shadow-[var(--shadow-glow)]">
          R
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">Company Logo</div>
          <div className="text-xs text-muted-foreground">PNG or SVG, transparent background, minimum 512×512.</div>
        </div>
        <Button variant="outline" size="sm">
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Upload Logo
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Company Name" htmlFor="cname">
          <Input id="cname" defaultValue="Riayah Care" />
        </Field>
        <Field label="Trade Name" htmlFor="tname">
          <Input id="tname" placeholder="Trading as…" />
        </Field>
        <Field label="Country" htmlFor="cnt">
          <Select defaultValue="IN">
            <SelectTrigger id="cnt"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">India</SelectItem>
              <SelectItem value="AE">United Arab Emirates</SelectItem>
              <SelectItem value="SA">Saudi Arabia</SelectItem>
              <SelectItem value="OM">Oman</SelectItem>
              <SelectItem value="KW">Kuwait</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" type="tel" placeholder="+91 …" />
        </Field>
        <Field label="WhatsApp" htmlFor="wa">
          <Input id="wa" type="tel" placeholder="+91 …" />
        </Field>
        <Field label="Official Email" htmlFor="email">
          <Input id="email" type="email" placeholder="hello@riayahcare.com" />
        </Field>
        <Field label="Website" htmlFor="site">
          <Input id="site" type="url" placeholder="https://riayahcare.com" />
        </Field>
        <Field label="GST / Registration" htmlFor="gst">
          <Input id="gst" placeholder="Registration number" />
        </Field>
        <Field label="Tax Number" htmlFor="tax">
          <Input id="tax" placeholder="TIN / VAT" />
        </Field>
        <Field label="Support Email" htmlFor="support">
          <Input id="support" type="email" placeholder="support@riayahcare.com" />
        </Field>
        <Field label="Emergency Contact" htmlFor="emerg">
          <Input id="emerg" type="tel" placeholder="24×7 hotline" />
        </Field>
        <Field label="Office Hours" htmlFor="hours">
          <Input id="hours" placeholder="Mon–Sat, 9:00 – 18:00 IST" />
        </Field>
        <Field label="Address" htmlFor="addr" className="md:col-span-2">
          <Textarea id="addr" rows={3} placeholder="Full postal address" />
        </Field>
      </div>

      <FormFooter />
    </SectionCard>
  );
}

function AIConfigSection() {
  const [temp, setTemp] = useState([0.4]);
  return (
    <SectionCard
      title="AI Configuration"
      description="Master controls for RiayahOS intelligence features. Individual toggles require the master switch to be enabled."
      actions={
        <>
          <Button variant="outline" size="sm">
            <TestTube2 className="mr-1.5 h-3.5 w-3.5" />
            Test AI
          </Button>
        </>
      }
    >
      <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-semibold text-foreground">Master AI Toggle</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Enable or disable all AI-powered features across RiayahOS.
            </div>
          </div>
        </div>
        <Switch defaultChecked />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ToggleRow title="Medical AI" description="Report analysis, extraction, summaries." defaultChecked />
        <ToggleRow title="Translation AI" description="Multi-language patient communication." defaultChecked />
        <ToggleRow title="Case Summary AI" description="Executive summaries per case." defaultChecked />
        <ToggleRow title="Revenue Prediction AI" description="Probability & forecast models." />
        <ToggleRow title="Lead Scoring AI" description="Automatic lead qualification." />
        <ToggleRow title="Case Health Score AI" description="Real-time case health monitoring." defaultChecked />
        <ToggleRow title="Daily Brief AI" description="Morning operational summary." />
      </div>

      <Separator className="my-6" />

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Default AI Model" htmlFor="model">
          <Select defaultValue="gpt-4.1">
            <SelectTrigger id="model"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
              <SelectItem value="claude-3.7">Claude 3.7 Sonnet</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Prompt Version" htmlFor="pv">
          <Select defaultValue="v1.2">
            <SelectTrigger id="pv"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="v1.0">v1.0 — Baseline</SelectItem>
              <SelectItem value="v1.1">v1.1 — Refined</SelectItem>
              <SelectItem value="v1.2">v1.2 — Current</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={`Temperature (${temp[0].toFixed(2)})`} htmlFor="temp" hint="Lower = deterministic, higher = creative.">
          <Slider id="temp" min={0} max={1} step={0.05} value={temp} onValueChange={setTemp} />
        </Field>
        <Field label="Max Tokens" htmlFor="mt">
          <Input id="mt" type="number" defaultValue={2048} min={256} max={16000} />
        </Field>
      </div>

      <FormFooter sensitive />
    </SectionCard>
  );
}

function WhatsAppSection() {
  return (
    <SectionCard
      title="WhatsApp — Evolution API"
      description="Configure the Evolution API instance powering all patient WhatsApp communication."
      actions={<StatusChip status="disconnected" />}
    >
      <IntegrationMeta status="disconnected" lastTested="Never" />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Server URL" htmlFor="wa-url">
          <Input id="wa-url" placeholder="https://evolution.yourdomain.com" />
        </Field>
        <Field label="Instance Name" htmlFor="wa-inst">
          <Input id="wa-inst" defaultValue="riayah-primary" />
        </Field>
        <Field label="API Key" htmlFor="wa-key">
          <SecretInput id="wa-key" placeholder="Evolution API key" />
        </Field>
        <Field label="Webhook URL" htmlFor="wa-hook">
          <Input id="wa-hook" placeholder="https://…/webhooks/whatsapp" />
        </Field>
        <Field label="Phone Number" htmlFor="wa-phone">
          <Input id="wa-phone" placeholder="+91 …" />
        </Field>
        <Field label="Last Connected" htmlFor="wa-lc">
          <Input id="wa-lc" value="Never" readOnly />
        </Field>
      </div>

      <FormFooter
        sensitive
        extra={
          <>
            <Button variant="outline" size="sm" disabled>
              <TestTube2 className="mr-1.5 h-3.5 w-3.5" />
              Test Connection
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Unplug className="mr-1.5 h-3.5 w-3.5" />
              Disconnect
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <PlugZap className="mr-1.5 h-3.5 w-3.5" />
              Connect
            </Button>
          </>
        }
      />
    </SectionCard>
  );
}

function MetaSection() {
  return (
    <SectionCard
      title="Meta Business"
      description="Meta Business Manager, WhatsApp Business, Instagram, and Facebook Page configuration."
      actions={<StatusChip status="disconnected" />}
    >
      <IntegrationMeta status="disconnected" lastTested="Never" />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Meta App ID" htmlFor="m-app"><Input id="m-app" placeholder="App ID" /></Field>
        <Field label="Meta App Secret" htmlFor="m-sec"><SecretInput id="m-sec" placeholder="App secret" /></Field>
        <Field label="Business Manager ID" htmlFor="m-bm"><Input id="m-bm" placeholder="BM ID" /></Field>
        <Field label="WhatsApp Business ID" htmlFor="m-wa"><Input id="m-wa" placeholder="WABA ID" /></Field>
        <Field label="Instagram Business ID" htmlFor="m-ig"><Input id="m-ig" placeholder="IG ID" /></Field>
        <Field label="Facebook Page ID" htmlFor="m-fb"><Input id="m-fb" placeholder="Page ID" /></Field>
        <Field label="Access Token" htmlFor="m-tok"><SecretInput id="m-tok" placeholder="Long-lived access token" /></Field>
        <Field label="Webhook Verify Token" htmlFor="m-ver"><SecretInput id="m-ver" placeholder="Verify token" /></Field>
        <Field label="Token Expiry" htmlFor="m-exp"><Input id="m-exp" value="—" readOnly /></Field>
      </div>

      <FormFooter
        sensitive
        extra={
          <Button variant="outline" size="sm" disabled>
            <TestTube2 className="mr-1.5 h-3.5 w-3.5" />
            Verify
          </Button>
        }
      />
    </SectionCard>
  );
}

function OpenAISection() {
  const [temp, setTemp] = useState([0.3]);
  return (
    <SectionCard
      title="OpenAI"
      description="OpenAI API credentials and usage governance."
      actions={<StatusChip status="disconnected" />}
    >
      <IntegrationMeta status="disconnected" lastTested="Never" />

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="API Key" htmlFor="oa-key"><SecretInput id="oa-key" placeholder="sk-…" /></Field>
        <Field label="Organization ID" htmlFor="oa-org"><Input id="oa-org" placeholder="org-…" /></Field>
        <Field label="Project ID" htmlFor="oa-proj"><Input id="oa-proj" placeholder="proj_…" /></Field>
        <Field label="Default Model" htmlFor="oa-model">
          <Select defaultValue="gpt-4.1">
            <SelectTrigger id="oa-model"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={`Temperature (${temp[0].toFixed(2)})`} htmlFor="oa-t">
          <Slider id="oa-t" min={0} max={1} step={0.05} value={temp} onValueChange={setTemp} />
        </Field>
        <Field label="Max Tokens" htmlFor="oa-mt"><Input id="oa-mt" type="number" defaultValue={2048} /></Field>
        <Field label="Monthly Budget (USD)" htmlFor="oa-b"><Input id="oa-b" type="number" placeholder="0" /></Field>
        <Field label="Usage (this month)" htmlFor="oa-u"><Input id="oa-u" value="$0.00 / month" readOnly /></Field>
      </div>

      <FormFooter
        sensitive
        extra={
          <Button variant="outline" size="sm" disabled>
            <TestTube2 className="mr-1.5 h-3.5 w-3.5" />
            Test API
          </Button>
        }
      />
    </SectionCard>
  );
}

function N8nSection() {
  return (
    <SectionCard
      title="n8n Automation"
      description="Workflow automation and event routing endpoints."
      actions={<StatusChip status="disconnected" />}
    >
      <IntegrationMeta status="disconnected" lastTested="Never" />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Base URL" htmlFor="n-base"><Input id="n-base" placeholder="https://n8n.yourdomain.com" /></Field>
        <Field label="Webhook URL" htmlFor="n-hook"><Input id="n-hook" placeholder="https://n8n.…/webhook/…" /></Field>
        <Field label="Secret" htmlFor="n-sec"><SecretInput id="n-sec" placeholder="Signing secret" /></Field>
        <Field label="Last Execution" htmlFor="n-le"><Input id="n-le" value="Never" readOnly /></Field>
        <Field label="Running Workflows" htmlFor="n-run"><Input id="n-run" value="0" readOnly /></Field>
      </div>
      <FormFooter
        sensitive
        extra={
          <Button variant="outline" size="sm" disabled>
            <TestTube2 className="mr-1.5 h-3.5 w-3.5" />
            Test
          </Button>
        }
      />
    </SectionCard>
  );
}

function EmailSection() {
  return (
    <SectionCard
      title="Email (SMTP)"
      description="Outbound transactional email configuration."
      actions={<StatusChip status="disconnected" />}
    >
      <IntegrationMeta status="disconnected" lastTested="Never" />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="SMTP Host" htmlFor="s-host"><Input id="s-host" placeholder="smtp.provider.com" /></Field>
        <Field label="SMTP Port" htmlFor="s-port"><Input id="s-port" type="number" defaultValue={587} /></Field>
        <Field label="Username" htmlFor="s-user"><Input id="s-user" placeholder="SMTP username" /></Field>
        <Field label="Password" htmlFor="s-pass"><SecretInput id="s-pass" placeholder="SMTP password" /></Field>
        <Field label="Encryption" htmlFor="s-enc">
          <Select defaultValue="tls">
            <SelectTrigger id="s-enc"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="ssl">SSL</SelectItem>
              <SelectItem value="tls">TLS / STARTTLS</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sender Name" htmlFor="s-sn"><Input id="s-sn" placeholder="Riayah Care" /></Field>
        <Field label="Sender Email" htmlFor="s-se"><Input id="s-se" type="email" placeholder="noreply@riayahcare.com" /></Field>
        <Field label="Reply-To Email" htmlFor="s-re"><Input id="s-re" type="email" placeholder="support@riayahcare.com" /></Field>
      </div>
      <FormFooter
        sensitive
        extra={
          <Button variant="outline" size="sm" disabled>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Send Test Email
          </Button>
        }
      />
    </SectionCard>
  );
}

function WebsiteSection() {
  return (
    <SectionCard
      title="Website API"
      description="Inbound leads and enquiries from the Riayah Care website."
      actions={<StatusChip status="disconnected" />}
    >
      <IntegrationMeta status="disconnected" lastTested="Never" />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Website URL" htmlFor="w-url"><Input id="w-url" placeholder="https://riayahcare.com" /></Field>
        <Field label="API Endpoint" htmlFor="w-api"><Input id="w-api" placeholder="https://riayahcare.com/api/leads" /></Field>
        <Field label="API Secret" htmlFor="w-sec"><SecretInput id="w-sec" placeholder="Shared secret" /></Field>
        <Field label="Webhook URL" htmlFor="w-hook"><Input id="w-hook" placeholder="https://…/webhooks/website" /></Field>
        <Field label="Last Lead Received" htmlFor="w-last"><Input id="w-last" value="Never" readOnly /></Field>
      </div>
      <FormFooter
        sensitive
        extra={
          <Button variant="outline" size="sm" disabled>
            <TestTube2 className="mr-1.5 h-3.5 w-3.5" />
            Test Endpoint
          </Button>
        }
      />
    </SectionCard>
  );
}

function NotificationsSection() {
  return (
    <SectionCard
      title="Notifications"
      description="Channel-level control over operational alerts and summaries."
    >
      <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-semibold text-foreground">Notifications Master Switch</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Enable or disable all outbound notifications from RiayahOS.
            </div>
          </div>
        </div>
        <Switch defaultChecked />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ToggleRow title="WhatsApp Notifications" defaultChecked />
        <ToggleRow title="Email Notifications" defaultChecked />
        <ToggleRow title="Desktop Notifications" defaultChecked />
        <ToggleRow title="Task Alerts" defaultChecked />
        <ToggleRow title="Hospital Reply Alerts" defaultChecked />
        <ToggleRow title="Lead Alerts" defaultChecked />
        <ToggleRow title="Daily Summary" description="Delivered every morning at 08:00." defaultChecked />
        <ToggleRow title="Weekly Summary" description="Delivered every Monday." />
      </div>

      <FormFooter />
    </SectionCard>
  );
}

function SecuritySection() {
  return (
    <SectionCard
      title="Security"
      description="Access, session, and encryption policies for the platform."
      actions={<StatusChip status="connected" />}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Session Timeout (minutes)" htmlFor="sec-sess">
          <Input id="sec-sess" type="number" defaultValue={60} min={5} max={1440} />
        </Field>
        <Field label="API Secret Rotation" htmlFor="sec-rot">
          <Select defaultValue="90">
            <SelectTrigger id="sec-rot"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Every 30 days</SelectItem>
              <SelectItem value="60">Every 60 days</SelectItem>
              <SelectItem value="90">Every 90 days</SelectItem>
              <SelectItem value="180">Every 180 days</SelectItem>
              <SelectItem value="manual">Manual only</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Password Policy" htmlFor="sec-pass">
          <Select defaultValue="strong">
            <SelectTrigger id="sec-pass"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic — 8+ characters</SelectItem>
              <SelectItem value="strong">Strong — 12+, mixed case, numbers, symbols</SelectItem>
              <SelectItem value="enterprise">Enterprise — 14+, rotation every 90 days</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Encryption Status" htmlFor="sec-enc">
          <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-foreground">AES-256 at rest, TLS 1.3 in transit</span>
          </div>
        </Field>
        <Field label="Allowed Domains" htmlFor="sec-dom" className="md:col-span-2" hint="One per line. Leave empty to allow all.">
          <Textarea id="sec-dom" rows={3} placeholder="riayahcare.com&#10;partner.example.com" />
        </Field>
        <Field label="IP Restrictions" htmlFor="sec-ip" className="md:col-span-2" hint="CIDR ranges, one per line.">
          <Textarea id="sec-ip" rows={3} placeholder="203.0.113.0/24" />
        </Field>
      </div>

      <Separator className="my-6" />

      <div className="space-y-3">
        <ToggleRow
          title="Two-Factor Authentication"
          description="Require TOTP or WebAuthn for all admin accounts."
          defaultChecked
        />
        <ToggleRow
          title="Enforce SSO for Staff"
          description="Require single sign-on for all internal users."
        />
      </div>

      <FormFooter
        sensitive
        extra={
          <Button variant="outline" size="sm">
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            Rotate Secrets Now
          </Button>
        }
      />
    </SectionCard>
  );
}

function BackupSection() {
  return (
    <SectionCard
      title="Backup & Recovery"
      description="Automated backup schedules, storage, and disaster recovery controls."
      actions={<StatusChip status="connected" />}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="surface-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Last Backup</div>
          <div className="mt-1 text-sm font-semibold text-foreground">—</div>
        </div>
        <div className="surface-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Backup Size</div>
          <div className="mt-1 text-sm font-semibold text-foreground">—</div>
        </div>
        <div className="surface-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Restore Points</div>
          <div className="mt-1 text-sm font-semibold text-foreground">0 available</div>
        </div>
      </div>

      <div className="mb-6">
        <ToggleRow
          title="Automatic Backup"
          description="Enable scheduled encrypted backups of the entire RiayahOS database and object storage."
          defaultChecked
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Backup Frequency" htmlFor="b-freq">
          <Select defaultValue="daily">
            <SelectTrigger id="b-freq"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Every hour</SelectItem>
              <SelectItem value="6h">Every 6 hours</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Backup Storage" htmlFor="b-store">
          <Select defaultValue="cloud">
            <SelectTrigger id="b-store"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cloud">Managed Cloud Storage</SelectItem>
              <SelectItem value="s3">Amazon S3</SelectItem>
              <SelectItem value="gcs">Google Cloud Storage</SelectItem>
              <SelectItem value="azure">Azure Blob Storage</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Restore Point" htmlFor="b-rp">
          <Select defaultValue="latest">
            <SelectTrigger id="b-rp"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest snapshot</SelectItem>
              <SelectItem value="none">— No restore points —</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Retention" htmlFor="b-ret">
          <Select defaultValue="30">
            <SelectTrigger id="b-ret"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <FormFooter
        sensitive
        extra={
          <>
            <Button variant="outline" size="sm">
              <DatabaseBackup className="mr-1.5 h-3.5 w-3.5" />
              Backup Now
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Restore
            </Button>
          </>
        }
      />
    </SectionCard>
  );
}

function AuditSection() {
  return (
    <SectionCard
      title="Audit Logs"
      description="Read-only history of configuration changes across RiayahOS."
      actions={
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          Read-only
        </div>
      }
    >
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="py-16 text-center">
                <div className="mx-auto max-w-sm">
                  <ScrollText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">No configuration changes yet</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Every save action across administration modules will be recorded here with actor, timestamp, module, and originating IP.
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

function SystemAdministration() {
  const [active, setActive] = useState<SectionId>("general");
  const current = useMemo(() => SECTIONS.find((s) => s.id === active)!, [active]);

  const renderSection = () => {
    switch (active) {
      case "general": return <GeneralSection />;
      case "company": return <CompanySection />;
      case "ai": return <AIConfigSection />;
      case "whatsapp": return <WhatsAppSection />;
      case "meta": return <MetaSection />;
      case "openai": return <OpenAISection />;
      case "n8n": return <N8nSection />;
      case "email": return <EmailSection />;
      case "website": return <WebsiteSection />;
      case "notifications": return <NotificationsSection />;
      case "security": return <SecuritySection />;
      case "backup": return <BackupSection />;
      case "audit": return <AuditSection />;
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="System Administration"
        subtitle="Configure the RiayahOS platform, integrations, security, and enterprise controls."
        actions={
          <Badge variant="outline" className="gap-1.5 border-success/20 bg-success/10 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Admin Access
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sub-navigation */}
        <aside className="surface-card h-fit p-3 lg:sticky lg:top-20">
          <div className="mb-2 px-2 py-1.5 lg:hidden">
            <Select value={active} onValueChange={(v) => setActive(v as SectionId)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SECTIONS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <nav className="hidden lg:block">
            {GROUPS.map((group) => {
              const items = SECTIONS.filter((s) => s.group === group);
              return (
                <div key={group} className="mb-3 last:mb-0">
                  <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {group}
                  </div>
                  <ul className="space-y-0.5">
                    {items.map((s) => {
                      const Icon = s.icon;
                      const isActive = active === s.id;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => setActive(s.id)}
                            className={cn(
                              "group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all",
                              "text-foreground/75 hover:bg-muted hover:text-foreground",
                              isActive && "bg-muted text-primary shadow-sm",
                            )}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                            )}
                            <Icon className={cn("h-[16px] w-[16px] shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span className="truncate">{s.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Administration</span>
            <span>›</span>
            <span className="font-medium text-foreground">{current.label}</span>
            <span className="text-muted-foreground">— {current.description}</span>
          </div>
          {renderSection()}
        </div>
      </div>
    </>
  );
}
