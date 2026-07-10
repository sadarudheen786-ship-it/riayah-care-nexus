/**
 * Workflow Automation Engine — declarative type system.
 *
 * This module defines the shape of automation rules, triggers, actions,
 * conditions, and execution logs. It is intentionally decoupled from any
 * external integration (WhatsApp / OpenAI / n8n / Meta / Website / Email);
 * integrations register themselves as `AutomationHook` implementations and
 * are wired in Module 5.2+.
 *
 * No rule is executed here — this file is the *contract* the engine will
 * eventually run against.
 */

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  Archive,
  BadgeCheck,
  Bell,
  Bot,
  Brain,
  Building2,
  Calendar,
  CalendarClock,
  Clock,
  CreditCard,
  FileCheck2,
  FileText,
  Files,
  Globe,
  HandCoins,
  Headphones,
  ListChecks,
  Mail,
  MessageCircle,
  MessageSquare,
  Mic,
  Move3d,
  BookUser,
  Plane,
  PlaneTakeoff,
  Play,
  Radio,
  Receipt,
  Send,
  Sparkles,
  Stethoscope,
  Timer,
  Upload,
  UserPlus,
  Users,
  Wallet,
  Workflow,
  X,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────
// Categories
// ────────────────────────────────────────────────────────────────

export type RuleCategoryId =
  | "patient_management"
  | "medical_reports"
  | "hospital_coordination"
  | "finance"
  | "travel"
  | "communication"
  | "ai"
  | "marketing"
  | "system";

export interface RuleCategory {
  id: RuleCategoryId;
  label: string;
  icon: LucideIcon;
  description: string;
  accent: "primary" | "info" | "success" | "warning" | "accent";
}

export const RULE_CATEGORIES: RuleCategory[] = [
  { id: "patient_management", label: "Patient Management", icon: Users, description: "Person, case, and lifecycle automations.", accent: "primary" },
  { id: "medical_reports", label: "Medical Reports", icon: FileCheck2, description: "Report ingestion, tagging, AI review.", accent: "info" },
  { id: "hospital_coordination", label: "Hospital Coordination", icon: Building2, description: "Hospital opinions, quotations, SLA.", accent: "primary" },
  { id: "finance", label: "Finance", icon: Wallet, description: "Payments, invoices, revenue events.", accent: "success" },
  { id: "travel", label: "Travel", icon: Plane, description: "Visa, flight, hotel logistics.", accent: "info" },
  { id: "communication", label: "Communication", icon: MessageSquare, description: "Outbound WhatsApp, email, notifications.", accent: "accent" },
  { id: "ai", label: "AI", icon: Brain, description: "Model calls, summaries, risk scoring.", accent: "accent" },
  { id: "marketing", label: "Marketing", icon: Sparkles, description: "Meta, website, campaign automations.", accent: "warning" },
  { id: "system", label: "System", icon: Workflow, description: "Housekeeping, escalations, admin.", accent: "primary" },
];

export const CATEGORY_MAP: Record<RuleCategoryId, RuleCategory> = RULE_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<RuleCategoryId, RuleCategory>,
);

// ────────────────────────────────────────────────────────────────
// Triggers
// ────────────────────────────────────────────────────────────────

export type TriggerId =
  | "whatsapp_message"
  | "person_created"
  | "case_created"
  | "medical_report_uploaded"
  | "voice_note_uploaded"
  | "passport_uploaded"
  | "hospital_opinion_received"
  | "quotation_created"
  | "patient_accepted"
  | "patient_declined"
  | "payment_received"
  | "flight_booked"
  | "patient_arrived"
  | "patient_discharged"
  | "followup_due"
  | "meta_lead"
  | "website_lead"
  | "email_received"
  | "ai_analysis_completed"
  | "manual"
  | "scheduled";

export interface TriggerDef {
  id: TriggerId;
  label: string;
  icon: LucideIcon;
  source: "Evolution API" | "OpenAI" | "Meta" | "Website" | "Email" | "n8n" | "Internal" | "Scheduler";
  description: string;
}

export const TRIGGERS: TriggerDef[] = [
  { id: "whatsapp_message", label: "New WhatsApp Message", icon: MessageCircle, source: "Evolution API", description: "Inbound WhatsApp message on the operations line." },
  { id: "person_created", label: "New Patient Created", icon: UserPlus, source: "Internal", description: "Person record created in the system." },
  { id: "case_created", label: "Case Created", icon: FileText, source: "Internal", description: "A case is opened for a patient." },
  { id: "medical_report_uploaded", label: "Medical Report Uploaded", icon: FileCheck2, source: "Internal", description: "Report added to the case repository." },
  { id: "voice_note_uploaded", label: "Voice Note Uploaded", icon: Mic, source: "Internal", description: "Voice note ready for transcription." },
  { id: "passport_uploaded", label: "Passport Uploaded", icon: BookUser, source: "Internal", description: "Passport captured for visa/logistics." },
  { id: "hospital_opinion_received", label: "Hospital Opinion Received", icon: Stethoscope, source: "Internal", description: "Hospital returned an opinion." },
  { id: "quotation_created", label: "Quotation Created", icon: Receipt, source: "Internal", description: "New treatment quotation issued." },
  { id: "patient_accepted", label: "Patient Accepted", icon: BadgeCheck, source: "Internal", description: "Patient accepted the treatment plan." },
  { id: "patient_declined", label: "Patient Declined", icon: X, source: "Internal", description: "Patient declined or lost." },
  { id: "payment_received", label: "Payment Received", icon: CreditCard, source: "Internal", description: "Payment recorded against a case." },
  { id: "flight_booked", label: "Flight Booked", icon: PlaneTakeoff, source: "Internal", description: "Flight itinerary confirmed." },
  { id: "patient_arrived", label: "Patient Arrived", icon: Plane, source: "Internal", description: "Patient landed / arrived at hospital." },
  { id: "patient_discharged", label: "Patient Discharged", icon: HandCoins, source: "Internal", description: "Patient discharged from hospital." },
  { id: "followup_due", label: "Follow-up Due", icon: CalendarClock, source: "Scheduler", description: "Scheduled follow-up reached its due time." },
  { id: "meta_lead", label: "Meta Lead Received", icon: Radio, source: "Meta", description: "Facebook / Instagram lead form submission." },
  { id: "website_lead", label: "Website Lead Received", icon: Globe, source: "Website", description: "riayahcare.com inbound enquiry." },
  { id: "email_received", label: "Email Received", icon: Mail, source: "Email", description: "Inbound email to the ops mailbox." },
  { id: "ai_analysis_completed", label: "AI Analysis Completed", icon: Brain, source: "OpenAI", description: "AI pipeline finished producing output." },
  { id: "manual", label: "Manual Trigger", icon: Play, source: "Internal", description: "Fired by a coordinator from the UI." },
  { id: "scheduled", label: "Scheduled Trigger", icon: Clock, source: "Scheduler", description: "Cron-style time-based execution." },
];

export const TRIGGER_MAP: Record<TriggerId, TriggerDef> = TRIGGERS.reduce(
  (a, t) => ({ ...a, [t.id]: t }),
  {} as Record<TriggerId, TriggerDef>,
);

// ────────────────────────────────────────────────────────────────
// Actions
// ────────────────────────────────────────────────────────────────

export type ActionId =
  | "create_person"
  | "create_case"
  | "update_timeline"
  | "upload_document"
  | "assign_coordinator"
  | "create_task"
  | "create_followup"
  | "generate_notification"
  | "run_ai_analysis"
  | "send_email"
  | "send_whatsapp"
  | "generate_quotation"
  | "update_revenue"
  | "create_finance_record"
  | "move_workflow_stage"
  | "create_logistics_task"
  | "close_case"
  | "archive_case";

export interface ActionDef {
  id: ActionId;
  label: string;
  icon: LucideIcon;
  target: "Evolution API" | "OpenAI" | "Meta" | "Website" | "Email" | "n8n" | "Internal";
  description: string;
}

export const ACTIONS: ActionDef[] = [
  { id: "create_person", label: "Create Person", icon: UserPlus, target: "Internal", description: "Insert a new person record." },
  { id: "create_case", label: "Create Case", icon: FileText, target: "Internal", description: "Open a case for a patient." },
  { id: "update_timeline", label: "Update Timeline", icon: Activity, target: "Internal", description: "Post an entry to the case timeline." },
  { id: "upload_document", label: "Upload Document", icon: Upload, target: "Internal", description: "Attach a document to the repository." },
  { id: "assign_coordinator", label: "Assign Coordinator", icon: Headphones, target: "Internal", description: "Route the case to a coordinator." },
  { id: "create_task", label: "Create Task", icon: ListChecks, target: "Internal", description: "Add a task to the operations board." },
  { id: "create_followup", label: "Create Follow-up", icon: Calendar, target: "Internal", description: "Schedule a future follow-up." },
  { id: "generate_notification", label: "Generate Notification", icon: Bell, target: "Internal", description: "Push a notification to the app." },
  { id: "run_ai_analysis", label: "Run AI Analysis", icon: Brain, target: "OpenAI", description: "Kick off an AI pipeline." },
  { id: "send_email", label: "Send Email", icon: Mail, target: "Email", description: "Send an email via configured SMTP." },
  { id: "send_whatsapp", label: "Send WhatsApp", icon: Send, target: "Evolution API", description: "Send a WhatsApp message." },
  { id: "generate_quotation", label: "Generate Quotation", icon: Receipt, target: "Internal", description: "Build a quotation from templates." },
  { id: "update_revenue", label: "Update Revenue", icon: Wallet, target: "Internal", description: "Refresh revenue projections." },
  { id: "create_finance_record", label: "Create Finance Record", icon: HandCoins, target: "Internal", description: "Record a financial transaction." },
  { id: "move_workflow_stage", label: "Move Workflow Stage", icon: Move3d, target: "Internal", description: "Advance the case in the workflow engine." },
  { id: "create_logistics_task", label: "Create Logistics Task", icon: Plane, target: "Internal", description: "Add visa/flight/hotel task." },
  { id: "close_case", label: "Close Case", icon: X, target: "Internal", description: "Mark case as closed." },
  { id: "archive_case", label: "Archive Case", icon: Archive, target: "Internal", description: "Move case to long-term archive." },
];

export const ACTION_MAP: Record<ActionId, ActionDef> = ACTIONS.reduce(
  (a, x) => ({ ...a, [x.id]: x }),
  {} as Record<ActionId, ActionDef>,
);

// ────────────────────────────────────────────────────────────────
// Conditions
// ────────────────────────────────────────────────────────────────

export type ConditionField =
  | "patient_country"
  | "disease"
  | "hospital"
  | "department"
  | "priority"
  | "lead_source"
  | "revenue_inr"
  | "case_stage"
  | "language"
  | "medical_report_type";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "in"
  | "not_in"
  | "greater_than"
  | "less_than"
  | "contains"
  | "is_empty"
  | "is_not_empty";

export interface Condition {
  field: ConditionField;
  operator: ConditionOperator;
  value?: string | number | string[];
}

export const CONDITION_FIELDS: { id: ConditionField; label: string }[] = [
  { id: "patient_country", label: "Patient Country" },
  { id: "disease", label: "Disease" },
  { id: "hospital", label: "Hospital" },
  { id: "department", label: "Department" },
  { id: "priority", label: "Priority" },
  { id: "lead_source", label: "Lead Source" },
  { id: "revenue_inr", label: "Revenue (INR)" },
  { id: "case_stage", label: "Case Stage" },
  { id: "language", label: "Language" },
  { id: "medical_report_type", label: "Medical Report Type" },
];

// ────────────────────────────────────────────────────────────────
// Rule + execution log
// ────────────────────────────────────────────────────────────────

export type RuleStatus = "active" | "inactive" | "draft" | "error";
export type RulePriority = "critical" | "high" | "normal" | "low";

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategoryId;
  trigger: TriggerId;
  conditions: Condition[];
  actions: ActionId[];
  status: RuleStatus;
  priority: RulePriority;
  delaySeconds: number;
  maxRetries: number;
  timeoutSeconds: number;
  createdBy: string;
  createdAt: string;
  lastModifiedAt: string;
  lastExecutedAt: string | null;
  executionCount: number;
  successCount: number;
  failureCount: number;
  isSystem: boolean;
  isIntegrationReady: boolean;
}

export type ExecutionStatus = "success" | "failed" | "pending" | "skipped" | "retrying";

export interface ExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredBy: string;
  triggeredAt: string;
  durationMs: number;
  status: ExecutionStatus;
  errorMessage?: string;
  retryCount: number;
}

// ────────────────────────────────────────────────────────────────
// Default system rules — all disabled, no live business data
// ────────────────────────────────────────────────────────────────

export const SYSTEM_RULES: AutomationRule[] = [
  {
    id: "sys-whatsapp-create-person",
    name: "New WhatsApp → Create Person",
    description: "When a new WhatsApp message arrives from an unknown number, create a Person record and open a lead.",
    category: "patient_management",
    trigger: "whatsapp_message",
    conditions: [{ field: "lead_source", operator: "equals", value: "WhatsApp" }],
    actions: ["create_person", "create_case", "assign_coordinator", "update_timeline"],
    status: "inactive",
    priority: "high",
    delaySeconds: 0,
    maxRetries: 3,
    timeoutSeconds: 30,
    createdBy: "System",
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastExecutedAt: null,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    isSystem: true,
    isIntegrationReady: false,
  },
  {
    id: "sys-report-ai-analysis",
    name: "Medical Report → AI Analysis",
    description: "Every uploaded medical report is queued for OpenAI extraction and clinical summarisation.",
    category: "medical_reports",
    trigger: "medical_report_uploaded",
    conditions: [{ field: "medical_report_type", operator: "is_not_empty" }],
    actions: ["run_ai_analysis", "update_timeline"],
    status: "inactive",
    priority: "high",
    delaySeconds: 5,
    maxRetries: 2,
    timeoutSeconds: 120,
    createdBy: "System",
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastExecutedAt: null,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    isSystem: true,
    isIntegrationReady: false,
  },
  {
    id: "sys-ai-update-case",
    name: "AI Analysis → Update Case",
    description: "When an AI analysis completes, update case metadata, timeline, and intelligence scores.",
    category: "ai",
    trigger: "ai_analysis_completed",
    conditions: [],
    actions: ["update_timeline", "move_workflow_stage", "generate_notification"],
    status: "inactive",
    priority: "normal",
    delaySeconds: 0,
    maxRetries: 2,
    timeoutSeconds: 30,
    createdBy: "System",
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastExecutedAt: null,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    isSystem: true,
    isIntegrationReady: false,
  },
  {
    id: "sys-opinion-notify",
    name: "Hospital Opinion → Notify Coordinator",
    description: "When a hospital returns an opinion, notify the assigned coordinator and stage the reply for review.",
    category: "hospital_coordination",
    trigger: "hospital_opinion_received",
    conditions: [],
    actions: ["generate_notification", "create_task", "update_timeline"],
    status: "inactive",
    priority: "high",
    delaySeconds: 0,
    maxRetries: 2,
    timeoutSeconds: 15,
    createdBy: "System",
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastExecutedAt: null,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    isSystem: true,
    isIntegrationReady: false,
  },
  {
    id: "sys-quotation-revenue",
    name: "Quotation → Update Revenue",
    description: "Every new quotation refreshes expected revenue, FX conversion, and forecast dashboards.",
    category: "finance",
    trigger: "quotation_created",
    conditions: [],
    actions: ["update_revenue", "update_timeline"],
    status: "inactive",
    priority: "normal",
    delaySeconds: 0,
    maxRetries: 3,
    timeoutSeconds: 20,
    createdBy: "System",
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastExecutedAt: null,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    isSystem: true,
    isIntegrationReady: false,
  },
  {
    id: "sys-accepted-logistics",
    name: "Patient Accepted → Logistics",
    description: "When a patient accepts the treatment plan, spin up visa, flight, and hotel logistics tasks.",
    category: "travel",
    trigger: "patient_accepted",
    conditions: [],
    actions: ["create_logistics_task", "assign_coordinator", "move_workflow_stage", "generate_notification"],
    status: "inactive",
    priority: "critical",
    delaySeconds: 0,
    maxRetries: 3,
    timeoutSeconds: 45,
    createdBy: "System",
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastExecutedAt: null,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    isSystem: true,
    isIntegrationReady: false,
  },
  {
    id: "sys-declined-close",
    name: "Patient Declined → Close Case",
    description: "When a patient declines, capture the reason, notify the team, and close the case.",
    category: "patient_management",
    trigger: "patient_declined",
    conditions: [],
    actions: ["update_timeline", "generate_notification", "close_case"],
    status: "inactive",
    priority: "normal",
    delaySeconds: 0,
    maxRetries: 1,
    timeoutSeconds: 15,
    createdBy: "System",
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastExecutedAt: null,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    isSystem: true,
    isIntegrationReady: false,
  },
  {
    id: "sys-payment-finance",
    name: "Payment Received → Finance",
    description: "Every incoming payment posts to Finance, updates revenue, and issues an internal notification.",
    category: "finance",
    trigger: "payment_received",
    conditions: [],
    actions: ["create_finance_record", "update_revenue", "generate_notification", "update_timeline"],
    status: "inactive",
    priority: "high",
    delaySeconds: 0,
    maxRetries: 3,
    timeoutSeconds: 30,
    createdBy: "System",
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastExecutedAt: null,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    isSystem: true,
    isIntegrationReady: false,
  },
];

// ────────────────────────────────────────────────────────────────
// Integration hooks — reserved for Module 5.2
// ────────────────────────────────────────────────────────────────

export interface IntegrationHook {
  id: "evolution" | "openai" | "meta" | "website" | "email" | "n8n";
  label: string;
  provides: TriggerId[];
  consumes: ActionId[];
  status: "reserved" | "connected" | "disconnected";
}

export const INTEGRATION_HOOKS: IntegrationHook[] = [
  {
    id: "evolution",
    label: "Evolution API (WhatsApp)",
    provides: ["whatsapp_message", "voice_note_uploaded"],
    consumes: ["send_whatsapp"],
    status: "reserved",
  },
  {
    id: "openai",
    label: "OpenAI",
    provides: ["ai_analysis_completed"],
    consumes: ["run_ai_analysis"],
    status: "reserved",
  },
  {
    id: "meta",
    label: "Meta Business",
    provides: ["meta_lead"],
    consumes: [],
    status: "reserved",
  },
  {
    id: "website",
    label: "Website API",
    provides: ["website_lead"],
    consumes: [],
    status: "reserved",
  },
  {
    id: "email",
    label: "Email (SMTP/IMAP)",
    provides: ["email_received"],
    consumes: ["send_email"],
    status: "reserved",
  },
  {
    id: "n8n",
    label: "n8n Automation",
    provides: ["manual", "scheduled"],
    consumes: [],
    status: "reserved",
  },
];

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

export function formatCondition(c: Condition): string {
  const field = CONDITION_FIELDS.find((f) => f.id === c.field)?.label ?? c.field;
  const val = Array.isArray(c.value) ? c.value.join(", ") : c.value ?? "";
  const op = c.operator.replace(/_/g, " ");
  return `${field} ${op}${val !== "" ? ` ${val}` : ""}`.trim();
}

export function priorityTone(p: RulePriority): string {
  switch (p) {
    case "critical":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "high":
      return "border-warning/30 bg-warning/10 text-warning";
    case "normal":
      return "border-info/30 bg-info/10 text-info";
    case "low":
      return "border-border bg-muted text-muted-foreground";
  }
}

export function statusTone(s: RuleStatus): string {
  switch (s) {
    case "active":
      return "border-success/30 bg-success/10 text-success";
    case "inactive":
      return "border-border bg-muted text-muted-foreground";
    case "draft":
      return "border-info/30 bg-info/10 text-info";
    case "error":
      return "border-destructive/30 bg-destructive/10 text-destructive";
  }
}
