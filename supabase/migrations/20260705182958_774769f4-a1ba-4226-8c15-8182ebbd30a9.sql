
-- =========================================================
-- RiayahOS — Enterprise extension
-- =========================================================

-- ---------- Enums ----------
CREATE TYPE public.notification_channel AS ENUM ('in_app','email','sms','whatsapp','push');
CREATE TYPE public.notification_status AS ENUM ('pending','sent','delivered','read','failed');
CREATE TYPE public.notification_type AS ENUM (
  'case_update','sla_breach','new_lead','task_assigned','follow_up_due',
  'quotation_response','payment_received','document_uploaded','ai_insight','system'
);
CREATE TYPE public.referral_partner_type AS ENUM ('individual','clinic','agency','corporate','embassy','insurance','other');
CREATE TYPE public.referral_transaction_status AS ENUM ('pending','approved','invoiced','paid','cancelled');
CREATE TYPE public.ai_log_status AS ENUM ('success','error','timeout','rate_limited');

-- ---------- Helper: update_updated_at_column already exists ----------

-- =========================================================
-- MASTER: countries
-- =========================================================
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iso2 TEXT UNIQUE NOT NULL,
  iso3 TEXT UNIQUE,
  name TEXT NOT NULL,
  dial_code TEXT,
  region TEXT,
  is_gcc BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_countries_name ON public.countries(name);
CREATE INDEX idx_countries_region ON public.countries(region);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.countries TO authenticated;
GRANT ALL ON public.countries TO service_role;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read countries" ON public.countries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins write countries" ON public.countries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_countries_updated_at BEFORE UPDATE ON public.countries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- MASTER: languages
-- =========================================================
CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT,
  is_rtl BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_languages_name ON public.languages(name);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.languages TO authenticated;
GRANT ALL ON public.languages TO service_role;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read languages" ON public.languages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins write languages" ON public.languages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_languages_updated_at BEFORE UPDATE ON public.languages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- MASTER: currencies
-- =========================================================
CREATE TABLE public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT,
  decimals SMALLINT NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.currencies TO authenticated;
GRANT ALL ON public.currencies TO service_role;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read currencies" ON public.currencies FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins write currencies" ON public.currencies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_currencies_updated_at BEFORE UPDATE ON public.currencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- MASTER: medical_specialties
-- =========================================================
CREATE TABLE public.medical_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  parent_specialty_id UUID REFERENCES public.medical_specialties(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_specialties_name ON public.medical_specialties(name);
CREATE INDEX idx_specialties_parent ON public.medical_specialties(parent_specialty_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_specialties TO authenticated;
GRANT ALL ON public.medical_specialties TO service_role;
ALTER TABLE public.medical_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read specialties" ON public.medical_specialties FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins write specialties" ON public.medical_specialties FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_specialties_updated_at BEFORE UPDATE ON public.medical_specialties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- MASTER: disease_master
-- =========================================================
CREATE TABLE public.disease_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  icd10_code TEXT,
  synonyms TEXT[],
  typical_specialty_id UUID REFERENCES public.medical_specialties(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_disease_name ON public.disease_master(name);
CREATE INDEX idx_disease_icd10 ON public.disease_master(icd10_code);
CREATE INDEX idx_disease_specialty ON public.disease_master(typical_specialty_id);
CREATE INDEX idx_disease_synonyms ON public.disease_master USING gin(synonyms);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disease_master TO authenticated;
GRANT ALL ON public.disease_master TO service_role;
ALTER TABLE public.disease_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read diseases" ON public.disease_master FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins write diseases" ON public.disease_master FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_disease_updated_at BEFORE UPDATE ON public.disease_master
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- RELATIONSHIP: hospital_specialties
-- =========================================================
CREATE TABLE public.hospital_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES public.medical_specialties(id) ON DELETE CASCADE,
  department_name TEXT,
  lead_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hospital_id, specialty_id)
);
CREATE INDEX idx_hosp_spec_hospital ON public.hospital_specialties(hospital_id);
CREATE INDEX idx_hosp_spec_specialty ON public.hospital_specialties(specialty_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospital_specialties TO authenticated;
GRANT ALL ON public.hospital_specialties TO service_role;
ALTER TABLE public.hospital_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage hospital specialties" ON public.hospital_specialties FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_hosp_spec_updated_at BEFORE UPDATE ON public.hospital_specialties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- RELATIONSHIP: doctor_specialties
-- =========================================================
CREATE TABLE public.doctor_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES public.medical_specialties(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, specialty_id)
);
CREATE INDEX idx_doc_spec_doctor ON public.doctor_specialties(doctor_id);
CREATE INDEX idx_doc_spec_specialty ON public.doctor_specialties(specialty_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_specialties TO authenticated;
GRANT ALL ON public.doctor_specialties TO service_role;
ALTER TABLE public.doctor_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage doctor specialties" ON public.doctor_specialties FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_doc_spec_updated_at BEFORE UPDATE ON public.doctor_specialties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- RELATIONSHIP: doctor_hospitals
-- =========================================================
CREATE TABLE public.doctor_hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  role TEXT,
  since_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, hospital_id)
);
CREATE INDEX idx_doc_hosp_doctor ON public.doctor_hospitals(doctor_id);
CREATE INDEX idx_doc_hosp_hospital ON public.doctor_hospitals(hospital_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_hospitals TO authenticated;
GRANT ALL ON public.doctor_hospitals TO service_role;
ALTER TABLE public.doctor_hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage doctor hospitals" ON public.doctor_hospitals FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_doc_hosp_updated_at BEFORE UPDATE ON public.doctor_hospitals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- BUSINESS: referral_partners
-- =========================================================
CREATE TABLE public.referral_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  partner_type public.referral_partner_type NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  country TEXT,
  city TEXT,
  commission_percentage NUMERIC(5,2),
  agreement_start_date DATE,
  agreement_end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_referral_partners_name ON public.referral_partners(name);
CREATE INDEX idx_referral_partners_country ON public.referral_partners(country);
CREATE INDEX idx_referral_partners_active ON public.referral_partners(is_active) WHERE deleted_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_partners TO authenticated;
GRANT ALL ON public.referral_partners TO service_role;
ALTER TABLE public.referral_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage referral partners" ON public.referral_partners FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_referral_partners_updated_at BEFORE UPDATE ON public.referral_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- BUSINESS: referral_transactions
-- =========================================================
CREATE TABLE public.referral_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.referral_partners(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  commission_amount NUMERIC(14,2) NOT NULL,
  currency public.currency_code NOT NULL DEFAULT 'INR',
  amount_inr NUMERIC(14,2),
  status public.referral_transaction_status NOT NULL DEFAULT 'pending',
  invoice_number TEXT,
  invoiced_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_ref_tx_partner ON public.referral_transactions(partner_id);
CREATE INDEX idx_ref_tx_case ON public.referral_transactions(case_id);
CREATE INDEX idx_ref_tx_status ON public.referral_transactions(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_transactions TO authenticated;
GRANT ALL ON public.referral_transactions TO service_role;
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage referral transactions" ON public.referral_transactions FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_referral_tx_updated_at BEFORE UPDATE ON public.referral_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- AI: ai_prompts
-- =========================================================
CREATE TABLE public.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category public.ai_analysis_type,
  model TEXT,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (name, version)
);
CREATE INDEX idx_ai_prompts_name ON public.ai_prompts(name);
CREATE INDEX idx_ai_prompts_category ON public.ai_prompts(category);
CREATE INDEX idx_ai_prompts_active ON public.ai_prompts(is_active) WHERE deleted_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompts TO authenticated;
GRANT ALL ON public.ai_prompts TO service_role;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read prompts" ON public.ai_prompts FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins write prompts" ON public.ai_prompts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ai_prompts_updated_at BEFORE UPDATE ON public.ai_prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- AI: ai_logs
-- =========================================================
CREATE TABLE public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES public.ai_prompts(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  model TEXT,
  request_payload JSONB,
  response_payload JSONB,
  tokens_input INT,
  tokens_output INT,
  cost_usd NUMERIC(10,4),
  latency_ms INT,
  status public.ai_log_status NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_logs_prompt ON public.ai_logs(prompt_id);
CREATE INDEX idx_ai_logs_case ON public.ai_logs(case_id);
CREATE INDEX idx_ai_logs_user ON public.ai_logs(user_id);
CREATE INDEX idx_ai_logs_created ON public.ai_logs(created_at DESC);
CREATE INDEX idx_ai_logs_status ON public.ai_logs(status);
GRANT SELECT ON public.ai_logs TO authenticated;
GRANT ALL ON public.ai_logs TO service_role;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read ai logs" ON public.ai_logs FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins manage ai logs" ON public.ai_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- WORKFLOW: workflow_templates
-- =========================================================
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  clinical_path public.clinical_path,
  stage public.workflow_stage,
  description TEXT,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  sla_hours INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (name, version)
);
CREATE INDEX idx_wf_templates_path ON public.workflow_templates(clinical_path);
CREATE INDEX idx_wf_templates_stage ON public.workflow_templates(stage);
CREATE INDEX idx_wf_templates_active ON public.workflow_templates(is_active) WHERE deleted_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_templates TO authenticated;
GRANT ALL ON public.workflow_templates TO service_role;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read workflow templates" ON public.workflow_templates FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins write workflow templates" ON public.workflow_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_wf_templates_updated_at BEFORE UPDATE ON public.workflow_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- WORKFLOW: notifications
-- =========================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  notification_type public.notification_type NOT NULL,
  channel public.notification_channel NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  status public.notification_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_recipient ON public.notifications(recipient_user_id);
CREATE INDEX idx_notif_case ON public.notifications(case_id);
CREATE INDEX idx_notif_status ON public.notifications(status);
CREATE INDEX idx_notif_type ON public.notifications(notification_type);
CREATE INDEX idx_notif_scheduled ON public.notifications(scheduled_at);
CREATE INDEX idx_notif_unread ON public.notifications(recipient_user_id, read_at) WHERE read_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their notifications" ON public.notifications FOR SELECT TO authenticated
  USING (
    recipient_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_role(auth.uid(),'admin')
  );
CREATE POLICY "Users update their notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (recipient_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  WITH CHECK (recipient_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Staff create notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete notifications" ON public.notifications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_notif_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- REPORTING: dashboard_snapshots
-- =========================================================
CREATE TABLE public.dashboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  scope TEXT NOT NULL,
  scope_id UUID,
  metrics JSONB NOT NULL,
  generated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (snapshot_date, scope, scope_id)
);
CREATE INDEX idx_snapshots_date ON public.dashboard_snapshots(snapshot_date DESC);
CREATE INDEX idx_snapshots_scope ON public.dashboard_snapshots(scope, scope_id);
CREATE INDEX idx_snapshots_metrics ON public.dashboard_snapshots USING gin(metrics);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_snapshots TO authenticated;
GRANT ALL ON public.dashboard_snapshots TO service_role;
ALTER TABLE public.dashboard_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read snapshots" ON public.dashboard_snapshots FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins write snapshots" ON public.dashboard_snapshots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_snapshots_updated_at BEFORE UPDATE ON public.dashboard_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- EXTEND: persons
-- =========================================================
ALTER TABLE public.persons
  ADD COLUMN IF NOT EXISTS preferred_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS preferred_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visa_status TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_persons_pref_hospital ON public.persons(preferred_hospital_id);
CREATE INDEX IF NOT EXISTS idx_persons_pref_doctor ON public.persons(preferred_doctor_id);

-- =========================================================
-- EXTEND: cases
-- =========================================================
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS estimated_treatment_cost NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS estimated_stay_days INT,
  ADD COLUMN IF NOT EXISTS expected_surgery_date DATE,
  ADD COLUMN IF NOT EXISTS case_health_score NUMERIC(5,2)
    CHECK (case_health_score IS NULL OR (case_health_score >= 0 AND case_health_score <= 100)),
  ADD COLUMN IF NOT EXISTS revenue_probability NUMERIC(5,2)
    CHECK (revenue_probability IS NULL OR (revenue_probability >= 0 AND revenue_probability <= 100)),
  ADD COLUMN IF NOT EXISTS ai_confidence_score NUMERIC(5,2)
    CHECK (ai_confidence_score IS NULL OR (ai_confidence_score >= 0 AND ai_confidence_score <= 100));
CREATE INDEX IF NOT EXISTS idx_cases_health ON public.cases(case_health_score);
CREATE INDEX IF NOT EXISTS idx_cases_revenue_prob ON public.cases(revenue_probability);

-- =========================================================
-- EXTEND: quotations
-- =========================================================
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS hospital_cost NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS riayah_service_fee NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS visa_cost NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS flight_cost NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS accommodation_cost NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS transport_cost NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS translator_cost NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS total_package_cost NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS gross_profit NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS net_profit NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS quotation_version INT NOT NULL DEFAULT 1;

-- =========================================================
-- EXTEND: hospitals
-- =========================================================
ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS accreditation TEXT,
  ADD COLUMN IF NOT EXISTS international_desk BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS international_desk_contact TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS response_sla_hours INT;

-- =========================================================
-- EXTEND: doctors
-- =========================================================
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS consultation_fee_currency public.currency_code DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS availability_schedule JSONB,
  ADD COLUMN IF NOT EXISTS international_case_experience INT DEFAULT 0;
