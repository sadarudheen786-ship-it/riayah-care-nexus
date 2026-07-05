
-- =========================================================
-- RiayahOS — Initial production schema
-- =========================================================

-- ---------- Extensions ----------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------- Enums ----------
CREATE TYPE public.app_role AS ENUM (
  'admin','coordinator','medical_reviewer','hospital_relations','finance','travel','viewer'
);

CREATE TYPE public.case_status AS ENUM (
  'new','in_review','awaiting_reports','awaiting_hospital_opinion',
  'quotation_sent','awaiting_decision','confirmed','travel_planning',
  'in_treatment','post_treatment','completed','cancelled','lost'
);

CREATE TYPE public.urgency_level AS ENUM ('low','medium','high','critical');
CREATE TYPE public.priority_level AS ENUM ('low','medium','high','critical');

CREATE TYPE public.lead_source AS ENUM (
  'whatsapp','website','referral','meta_ads','google_ads','instagram',
  'facebook','email','phone','walk_in','partner','other'
);

CREATE TYPE public.workflow_stage AS ENUM (
  'lead_captured','reports_requested','reports_received','medical_review',
  'hospital_shortlist','hospital_opinion_requested','hospital_opinion_received',
  'quotation_prepared','quotation_sent','patient_decision','confirmed',
  'visa_processing','travel_booking','arrival','op_consultation','admission',
  'surgery','icu','recovery','discharge','follow_up','closed'
);

CREATE TYPE public.clinical_path AS ENUM ('op_consultation','surgery','medical_management');
CREATE TYPE public.decision_status AS ENUM ('pending','accepted','declined','deferred','no_response');

CREATE TYPE public.comm_channel AS ENUM ('whatsapp','call','email','sms','note','voice_note','in_person');
CREATE TYPE public.comm_direction AS ENUM ('incoming','outgoing','internal');

CREATE TYPE public.report_translation_status AS ENUM ('not_required','pending','in_progress','completed');

CREATE TYPE public.ai_analysis_type AS ENUM (
  'lead_summary','urgency_detection','missing_reports','duplicate_detection',
  'conversion_probability','next_action','medical_summary','translation','other'
);

CREATE TYPE public.hospital_tier AS ENUM ('tier_1','tier_2','tier_3','partner','preferred');

CREATE TYPE public.opinion_status AS ENUM ('requested','in_review','received','declined','expired');

CREATE TYPE public.quotation_status AS ENUM ('draft','sent','accepted','declined','expired','revised');
CREATE TYPE public.currency_code AS ENUM ('INR','USD','AED','SAR','QAR','KWD','BHD','OMR','EUR','GBP');

CREATE TYPE public.document_type AS ENUM (
  'passport','visa','medical_report','hospital_opinion','quotation',
  'invoice','receipt','itinerary','discharge_summary','prescription',
  'insurance','consent_form','other'
);

CREATE TYPE public.finance_type AS ENUM ('invoice','payment','refund','commission','expense','adjustment');
CREATE TYPE public.finance_status AS ENUM ('pending','partial','paid','overdue','cancelled','refunded');

CREATE TYPE public.followup_status AS ENUM ('scheduled','completed','missed','cancelled','rescheduled');
CREATE TYPE public.task_status AS ENUM ('open','in_progress','blocked','done','cancelled');

CREATE TYPE public.logistics_type AS ENUM ('visa','flight','hotel','transport','insurance','local_stay','other');
CREATE TYPE public.logistics_status AS ENUM ('pending','booked','in_progress','completed','cancelled');

-- ---------- Shared functions ----------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ==========================================================
-- USERS (staff directory) + roles
-- ==========================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_is_active ON public.users(is_active) WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role check (no recursion in RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies: users
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Authenticated staff can view active users"
  ON public.users FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admins manage users"
  ON public.users FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Policies: user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ==========================================================
-- PERSONS (patients)
-- ==========================================================
CREATE TABLE public.persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  country_of_residence TEXT,
  city TEXT,
  address TEXT,
  passport_number TEXT,
  passport_issue_country TEXT,
  passport_expiry DATE,
  preferred_language TEXT,
  primary_phone TEXT,
  whatsapp_number TEXT,
  email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_persons_passport ON public.persons(passport_number);
CREATE INDEX idx_persons_phone ON public.persons(primary_phone);
CREATE INDEX idx_persons_whatsapp ON public.persons(whatsapp_number);
CREATE INDEX idx_persons_email ON public.persons(email);
CREATE INDEX idx_persons_nationality ON public.persons(nationality);
CREATE INDEX idx_persons_name_trgm ON public.persons USING gin ((coalesce(first_name,'')||' '||coalesce(last_name,'')) gin_trgm_ops);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.persons TO authenticated;
GRANT ALL ON public.persons TO service_role;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage persons"
  ON public.persons FOR ALL TO authenticated
  USING (deleted_at IS NULL OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (true);

CREATE TRIGGER trg_persons_updated_at
  BEFORE UPDATE ON public.persons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- HOSPITALS
-- ==========================================================
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  tier public.hospital_tier,
  accreditations TEXT[],
  specialties TEXT[],
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  commission_percentage NUMERIC(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_hospitals_name ON public.hospitals(name);
CREATE INDEX idx_hospitals_city ON public.hospitals(city);
CREATE INDEX idx_hospitals_active ON public.hospitals(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_hospitals_specialties ON public.hospitals USING gin(specialties);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospitals TO authenticated;
GRANT ALL ON public.hospitals TO service_role;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage hospitals"
  ON public.hospitals FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- DOCTORS
-- ==========================================================
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  specialty TEXT,
  sub_specialty TEXT,
  qualifications TEXT,
  languages TEXT[],
  years_experience INT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_doctors_hospital_id ON public.doctors(hospital_id);
CREATE INDEX idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX idx_doctors_active ON public.doctors(is_active) WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage doctors"
  ON public.doctors FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- CASES
-- ==========================================================
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE,
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  disease TEXT,
  specialty TEXT,
  diagnosis TEXT,
  status public.case_status NOT NULL DEFAULT 'new',
  urgency public.urgency_level NOT NULL DEFAULT 'medium',
  lead_source public.lead_source,
  workflow_stage public.workflow_stage NOT NULL DEFAULT 'lead_captured',
  clinical_path public.clinical_path,
  coordinator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  medical_reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  primary_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  primary_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  expected_revenue NUMERIC(14,2),
  expected_revenue_currency public.currency_code DEFAULT 'INR',
  probability NUMERIC(5,2) CHECK (probability IS NULL OR (probability >= 0 AND probability <= 100)),
  decision_status public.decision_status NOT NULL DEFAULT 'pending',
  target_country TEXT DEFAULT 'India',
  enquiry_date TIMESTAMPTZ DEFAULT now(),
  expected_decision_date DATE,
  expected_arrival_date DATE,
  actual_arrival_date DATE,
  discharge_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_cases_person_id ON public.cases(person_id);
CREATE INDEX idx_cases_status ON public.cases(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_workflow_stage ON public.cases(workflow_stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_urgency ON public.cases(urgency) WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_coordinator ON public.cases(coordinator_id);
CREATE INDEX idx_cases_hospital ON public.cases(primary_hospital_id);
CREATE INDEX idx_cases_lead_source ON public.cases(lead_source);
CREATE INDEX idx_cases_enquiry_date ON public.cases(enquiry_date DESC);
CREATE INDEX idx_cases_case_number ON public.cases(case_number);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage cases"
  ON public.cases FOR ALL TO authenticated
  USING (deleted_at IS NULL OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (true);
CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- COMMUNICATIONS
-- ==========================================================
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  channel public.comm_channel NOT NULL,
  direction public.comm_direction NOT NULL,
  subject TEXT,
  body TEXT,
  attachment_path TEXT,
  duration_seconds INT,
  from_identifier TEXT,
  to_identifier TEXT,
  external_message_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_comm_case_id ON public.communications(case_id);
CREATE INDEX idx_comm_person_id ON public.communications(person_id);
CREATE INDEX idx_comm_channel ON public.communications(channel);
CREATE INDEX idx_comm_occurred_at ON public.communications(occurred_at DESC);
CREATE INDEX idx_comm_external ON public.communications(external_message_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.communications TO authenticated;
GRANT ALL ON public.communications TO service_role;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage communications"
  ON public.communications FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_comm_updated_at
  BEFORE UPDATE ON public.communications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- MEDICAL REPORTS
-- ==========================================================
CREATE TABLE public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  report_type TEXT,
  title TEXT NOT NULL,
  storage_path TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  report_date DATE,
  issuing_hospital TEXT,
  issuing_doctor TEXT,
  language TEXT,
  translation_status public.report_translation_status DEFAULT 'not_required',
  translated_storage_path TEXT,
  notes TEXT,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_reports_case_id ON public.medical_reports(case_id);
CREATE INDEX idx_reports_person_id ON public.medical_reports(person_id);
CREATE INDEX idx_reports_report_date ON public.medical_reports(report_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_reports TO authenticated;
GRANT ALL ON public.medical_reports TO service_role;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage medical reports"
  ON public.medical_reports FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.medical_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- AI ANALYSIS
-- ==========================================================
CREATE TABLE public.ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  medical_report_id UUID REFERENCES public.medical_reports(id) ON DELETE CASCADE,
  analysis_type public.ai_analysis_type NOT NULL,
  model TEXT,
  prompt TEXT,
  output JSONB,
  summary TEXT,
  confidence NUMERIC(5,2),
  tokens_input INT,
  tokens_output INT,
  cost_usd NUMERIC(10,4),
  reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_case_id ON public.ai_analysis(case_id);
CREATE INDEX idx_ai_report_id ON public.ai_analysis(medical_report_id);
CREATE INDEX idx_ai_type ON public.ai_analysis(analysis_type);
CREATE INDEX idx_ai_output_gin ON public.ai_analysis USING gin(output);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_analysis TO authenticated;
GRANT ALL ON public.ai_analysis TO service_role;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage ai analysis"
  ON public.ai_analysis FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_ai_updated_at
  BEFORE UPDATE ON public.ai_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- HOSPITAL OPINIONS
-- ==========================================================
CREATE TABLE public.hospital_opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE RESTRICT,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  status public.opinion_status NOT NULL DEFAULT 'requested',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  treatment_recommendation TEXT,
  estimated_treatment_days INT,
  requires_surgery BOOLEAN,
  document_path TEXT,
  notes TEXT,
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_opinions_case_id ON public.hospital_opinions(case_id);
CREATE INDEX idx_opinions_hospital_id ON public.hospital_opinions(hospital_id);
CREATE INDEX idx_opinions_status ON public.hospital_opinions(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospital_opinions TO authenticated;
GRANT ALL ON public.hospital_opinions TO service_role;
ALTER TABLE public.hospital_opinions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage opinions"
  ON public.hospital_opinions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_opinions_updated_at
  BEFORE UPDATE ON public.hospital_opinions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- QUOTATIONS
-- ==========================================================
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT UNIQUE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  hospital_opinion_id UUID REFERENCES public.hospital_opinions(id) ON DELETE SET NULL,
  currency public.currency_code NOT NULL DEFAULT 'INR',
  treatment_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  room_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  misc_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  fx_rate_to_inr NUMERIC(14,6),
  total_inr NUMERIC(14,2),
  service_charge NUMERIC(14,2) DEFAULT 0,
  expected_net_revenue NUMERIC(14,2),
  status public.quotation_status NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  valid_until DATE,
  document_path TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_quotations_case_id ON public.quotations(case_id);
CREATE INDEX idx_quotations_hospital_id ON public.quotations(hospital_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);
CREATE INDEX idx_quotations_number ON public.quotations(quotation_number);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage quotations"
  ON public.quotations FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- DOCUMENTS
-- ==========================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  document_type public.document_type NOT NULL,
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  notes TEXT,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_documents_person_id ON public.documents(person_id);
CREATE INDEX idx_documents_type ON public.documents(document_type);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage documents"
  ON public.documents FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- FOLLOW-UPS
-- ==========================================================
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ NOT NULL,
  channel public.comm_channel,
  purpose TEXT,
  status public.followup_status NOT NULL DEFAULT 'scheduled',
  outcome TEXT,
  completed_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_followups_case_id ON public.follow_ups(case_id);
CREATE INDEX idx_followups_assigned ON public.follow_ups(assigned_to);
CREATE INDEX idx_followups_due ON public.follow_ups(due_at);
CREATE INDEX idx_followups_status ON public.follow_ups(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage follow ups"
  ON public.follow_ups FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_followups_updated_at
  BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- TASKS
-- ==========================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  priority public.priority_level NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'open',
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due ON public.tasks(due_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage tasks"
  ON public.tasks FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- FINANCE
-- ==========================================================
CREATE TABLE public.finance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  entry_type public.finance_type NOT NULL,
  currency public.currency_code NOT NULL DEFAULT 'INR',
  amount NUMERIC(14,2) NOT NULL,
  fx_rate_to_inr NUMERIC(14,6),
  amount_inr NUMERIC(14,2),
  party TEXT,
  reference_number TEXT,
  description TEXT,
  status public.finance_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_finance_case_id ON public.finance(case_id);
CREATE INDEX idx_finance_hospital_id ON public.finance(hospital_id);
CREATE INDEX idx_finance_type ON public.finance(entry_type);
CREATE INDEX idx_finance_status ON public.finance(status);
CREATE INDEX idx_finance_due ON public.finance(due_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance TO authenticated;
GRANT ALL ON public.finance TO service_role;
ALTER TABLE public.finance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage finance"
  ON public.finance FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_finance_updated_at
  BEFORE UPDATE ON public.finance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- LOGISTICS
-- ==========================================================
CREATE TABLE public.logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  logistics_type public.logistics_type NOT NULL,
  provider TEXT,
  reference_number TEXT,
  start_date DATE,
  end_date DATE,
  cost NUMERIC(14,2),
  currency public.currency_code DEFAULT 'INR',
  status public.logistics_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  document_path TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_logistics_case_id ON public.logistics(case_id);
CREATE INDEX idx_logistics_type ON public.logistics(logistics_type);
CREATE INDEX idx_logistics_status ON public.logistics(status);
CREATE INDEX idx_logistics_start ON public.logistics(start_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.logistics TO authenticated;
GRANT ALL ON public.logistics TO service_role;
ALTER TABLE public.logistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage logistics"
  ON public.logistics FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TRIGGER trg_logistics_updated_at
  BEFORE UPDATE ON public.logistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================================
-- ACTIVITY LOGS (append-only audit)
-- ==========================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_auth_id UUID,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_actor ON public.activity_logs(actor_user_id);
CREATE INDEX idx_activity_created ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_action ON public.activity_logs(action);

GRANT SELECT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view activity logs"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage activity logs"
  ON public.activity_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
