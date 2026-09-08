-- 1. New lead sources
ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'messenger';
ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'facebook_lead_ad';
ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'instagram_lead_ad';
ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'manual';

-- 2. New enums
DO $$ BEGIN
  CREATE TYPE public.intake_channel AS ENUM (
    'website','whatsapp','messenger','instagram','facebook','facebook_lead_ad','instagram_lead_ad','referral','manual','email','other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.intake_status AS ENUM (
    'received','processing','processed','needs_review','failed','duplicate_ignored'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.evidence_source AS ENUM (
    'patient_message','voice_transcript','medical_report','discharge_summary','prescription',
    'lab_report','pathology_report','radiology_report','other_document','existing_record',
    'doctor_opinion','hospital_opinion','manual_entry','lead_form'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.fact_status AS ENUM ('proposed','confirmed','rejected','conflicted','superseded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.extraction_status AS ENUM ('pending','processing','completed','failed','unsupported');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.triage_decider AS ENUM ('ai','human');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Demo separation
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.cases   ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_cases_is_demo ON public.cases(is_demo);

-- 4. Central intake inbox
CREATE TABLE IF NOT EXISTS public.lead_intake_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel public.intake_channel NOT NULL,
  provider TEXT,
  external_event_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.intake_status NOT NULL DEFAULT 'received',
  status_reason TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_email TEXT,
  contact_handle TEXT,
  locale TEXT,
  raw_content TEXT,
  raw_payload JSONB,
  media_storage_path TEXT,
  media_mime_type TEXT,
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  communication_id UUID REFERENCES public.communications(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_intake_provider_event
  ON public.lead_intake_events(provider, external_event_id)
  WHERE external_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intake_status ON public.lead_intake_events(status, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_intake_case ON public.lead_intake_events(case_id);
CREATE INDEX IF NOT EXISTS idx_intake_person ON public.lead_intake_events(person_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_intake_events TO authenticated;
GRANT ALL ON public.lead_intake_events TO service_role;
ALTER TABLE public.lead_intake_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage intake events" ON public.lead_intake_events
  FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER trg_intake_events_updated_at BEFORE UPDATE ON public.lead_intake_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Acquisition attribution
CREATE TABLE IF NOT EXISTS public.lead_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_event_id UUID REFERENCES public.lead_intake_events(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  channel public.intake_channel NOT NULL,
  platform TEXT,
  campaign_name TEXT,
  campaign_id TEXT,
  adset_name TEXT,
  adset_id TEXT,
  ad_name TEXT,
  ad_id TEXT,
  form_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer_url TEXT,
  landing_url TEXT,
  referral_partner_id UUID REFERENCES public.referral_partners(id) ON DELETE SET NULL,
  is_first_touch BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attribution_case ON public.lead_attribution(case_id);
CREATE INDEX IF NOT EXISTS idx_attribution_channel ON public.lead_attribution(channel);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_attribution TO authenticated;
GRANT ALL ON public.lead_attribution TO service_role;
ALTER TABLE public.lead_attribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage attribution" ON public.lead_attribution
  FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER trg_attribution_updated_at BEFORE UPDATE ON public.lead_attribution
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Evidence-tracked extracted facts
CREATE TABLE IF NOT EXISTS public.extracted_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  field_group TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_label TEXT,
  value_text TEXT,
  value_json JSONB,
  source public.evidence_source NOT NULL,
  source_quote TEXT,
  intake_event_id UUID REFERENCES public.lead_intake_events(id) ON DELETE SET NULL,
  communication_id UUID REFERENCES public.communications(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  medical_report_id UUID REFERENCES public.medical_reports(id) ON DELETE SET NULL,
  observed_at TIMESTAMPTZ,
  confidence NUMERIC(4,3),
  status public.fact_status NOT NULL DEFAULT 'proposed',
  conflict_group TEXT,
  confirmed_by UUID REFERENCES public.users(id),
  confirmed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_facts_case_field ON public.extracted_facts(case_id, field_key);
CREATE INDEX IF NOT EXISTS idx_facts_person_field ON public.extracted_facts(person_id, field_key);
CREATE INDEX IF NOT EXISTS idx_facts_status ON public.extracted_facts(status);
CREATE INDEX IF NOT EXISTS idx_facts_conflict ON public.extracted_facts(conflict_group) WHERE conflict_group IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.extracted_facts TO authenticated;
GRANT ALL ON public.extracted_facts TO service_role;
ALTER TABLE public.extracted_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage extracted facts" ON public.extracted_facts
  FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER trg_facts_updated_at BEFORE UPDATE ON public.extracted_facts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Voice transcripts
CREATE TABLE IF NOT EXISTS public.voice_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_event_id UUID REFERENCES public.lead_intake_events(id) ON DELETE CASCADE,
  communication_id UUID REFERENCES public.communications(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  audio_storage_path TEXT,
  audio_mime_type TEXT,
  duration_seconds INTEGER,
  language TEXT,
  transcript TEXT,
  model TEXT,
  status public.extraction_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_voice_case ON public.voice_transcripts(case_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_transcripts TO authenticated;
GRANT ALL ON public.voice_transcripts TO service_role;
ALTER TABLE public.voice_transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage voice transcripts" ON public.voice_transcripts
  FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER trg_voice_updated_at BEFORE UPDATE ON public.voice_transcripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Document extractions
CREATE TABLE IF NOT EXISTS public.document_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  medical_report_id UUID REFERENCES public.medical_reports(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  detected_document_type TEXT,
  processor_key TEXT NOT NULL,
  status public.extraction_status NOT NULL DEFAULT 'pending',
  extraction JSONB,
  raw_text TEXT,
  model TEXT,
  confidence NUMERIC(4,3),
  error_message TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_docext_case ON public.document_extractions(case_id);
CREATE INDEX IF NOT EXISTS idx_docext_status ON public.document_extractions(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_extractions TO authenticated;
GRANT ALL ON public.document_extractions TO service_role;
ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage document extractions" ON public.document_extractions
  FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER trg_docext_updated_at BEFORE UPDATE ON public.document_extractions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. AI triage assessments and human overrides
CREATE TABLE IF NOT EXISTS public.ai_triage_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  intake_event_id UUID REFERENCES public.lead_intake_events(id) ON DELETE SET NULL,
  decided_by_type public.triage_decider NOT NULL DEFAULT 'ai',
  recommended_priority public.urgency_level,
  previous_priority public.urgency_level,
  reason TEXT,
  evidence JSONB,
  information_used JSONB,
  confidence NUMERIC(4,3),
  model TEXT,
  requires_human_review BOOLEAN NOT NULL DEFAULT true,
  is_current BOOLEAN NOT NULL DEFAULT true,
  superseded_by UUID REFERENCES public.ai_triage_assessments(id) ON DELETE SET NULL,
  change_reason TEXT,
  overridden_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_triage_case_current ON public.ai_triage_assessments(case_id, is_current);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_triage_assessments TO authenticated;
GRANT ALL ON public.ai_triage_assessments TO service_role;
ALTER TABLE public.ai_triage_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage triage assessments" ON public.ai_triage_assessments
  FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER trg_triage_updated_at BEFORE UPDATE ON public.ai_triage_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Possible duplicate patients awaiting human confirmation
CREATE TABLE IF NOT EXISTS public.identity_match_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_event_id UUID REFERENCES public.lead_intake_events(id) ON DELETE CASCADE,
  new_person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  candidate_person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  match_score NUMERIC(4,3),
  matched_on JSONB,
  resolution TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_identity_resolution ON public.identity_match_candidates(resolution);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.identity_match_candidates TO authenticated;
GRANT ALL ON public.identity_match_candidates TO service_role;
ALTER TABLE public.identity_match_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage identity matches" ON public.identity_match_candidates
  FOR ALL TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE TRIGGER trg_identity_updated_at BEFORE UPDATE ON public.identity_match_candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Coordinator assignment rules
CREATE TABLE IF NOT EXISTS public.coordinator_assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  priority_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT false,
  match_countries TEXT[],
  match_languages TEXT[],
  match_specialties TEXT[],
  match_case_types TEXT[],
  match_priorities public.urgency_level[],
  match_sources public.intake_channel[],
  assign_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assign_to_role public.app_role,
  balance_by_workload BOOLEAN NOT NULL DEFAULT true,
  max_open_cases INTEGER,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assignment_rules_active ON public.coordinator_assignment_rules(is_active, priority_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coordinator_assignment_rules TO authenticated;
GRANT ALL ON public.coordinator_assignment_rules TO service_role;
ALTER TABLE public.coordinator_assignment_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view assignment rules" ON public.coordinator_assignment_rules
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Admins manage assignment rules" ON public.coordinator_assignment_rules
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));
CREATE TRIGGER trg_assignment_rules_updated_at BEFORE UPDATE ON public.coordinator_assignment_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. AI intake audit trail
CREATE TABLE IF NOT EXISTS public.ai_intake_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_event_id UUID REFERENCES public.lead_intake_events(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  input_source public.evidence_source,
  input_reference JSONB,
  model TEXT,
  output JSONB,
  evidence JSONB,
  human_change JSONB,
  changed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_audit_case ON public.ai_intake_audit(case_id, created_at DESC);

GRANT SELECT, INSERT ON public.ai_intake_audit TO authenticated;
GRANT ALL ON public.ai_intake_audit TO service_role;
ALTER TABLE public.ai_intake_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view ai audit" ON public.ai_intake_audit
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Staff can insert ai audit" ON public.ai_intake_audit
  FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));