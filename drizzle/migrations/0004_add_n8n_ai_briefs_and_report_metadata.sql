CREATE TABLE public.lead_ai_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  seriousness TEXT NOT NULL CHECK (seriousness IN ('critical', 'high', 'moderate', 'low')),
  seriousness_reason TEXT NOT NULL,
  temperature TEXT NOT NULL CHECK (temperature IN ('hot', 'warm', 'cold')),
  score DOUBLE PRECISION NOT NULL,
  summary TEXT NOT NULL,
  key_findings TEXT[] NOT NULL DEFAULT '{}',
  likely_specialty TEXT NOT NULL,
  suggested_hospitals TEXT[] NOT NULL DEFAULT '{}',
  missing_info TEXT[] NOT NULL DEFAULT '{}',
  talking_points TEXT[] NOT NULL DEFAULT '{}',
  questions_to_ask TEXT[] NOT NULL DEFAULT '{}',
  red_flags TEXT[] NOT NULL DEFAULT '{}',
  residence_confirmed BOOLEAN NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ar', 'en')),
  generated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lead_ai_briefs TO authenticated;
GRANT ALL ON public.lead_ai_briefs TO service_role;
REVOKE ALL ON public.lead_ai_briefs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.lead_ai_briefs FROM authenticated;
ALTER TABLE public.lead_ai_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read lead AI briefs" ON public.lead_ai_briefs
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE INDEX idx_lead_ai_briefs_latest ON public.lead_ai_briefs(lead_id, created_at DESC, id DESC);

CREATE TABLE public.lead_intake_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('instagram', 'facebook', 'whatsapp', 'website', 'lead_ad', 'email')),
  external_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  storage_path TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lead_intake_attachments TO authenticated;
GRANT ALL ON public.lead_intake_attachments TO service_role;
REVOKE ALL ON public.lead_intake_attachments FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.lead_intake_attachments FROM authenticated;
ALTER TABLE public.lead_intake_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read lead intake attachments" ON public.lead_intake_attachments
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE INDEX idx_lead_intake_attachments_lead ON public.lead_intake_attachments(lead_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_latest_lead_ai_briefs(p_lead_ids UUID[])
RETURNS TABLE (
  lead_id UUID,
  seriousness TEXT,
  seriousness_reason TEXT,
  temperature TEXT,
  score DOUBLE PRECISION,
  summary TEXT,
  key_findings TEXT[],
  likely_specialty TEXT,
  suggested_hospitals TEXT[],
  missing_info TEXT[],
  talking_points TEXT[],
  questions_to_ask TEXT[],
  red_flags TEXT[],
  residence_confirmed BOOLEAN,
  language TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $function$
  SELECT DISTINCT ON (brief.lead_id)
    brief.lead_id,
    brief.seriousness,
    brief.seriousness_reason,
    brief.temperature,
    brief.score,
    brief.summary,
    brief.key_findings,
    brief.likely_specialty,
    brief.suggested_hospitals,
    brief.missing_info,
    brief.talking_points,
    brief.questions_to_ask,
    brief.red_flags,
    brief.residence_confirmed,
    brief.language,
    brief.generated_at,
    brief.created_at
  FROM public.lead_ai_briefs AS brief
  WHERE brief.lead_id = ANY(COALESCE(p_lead_ids, ARRAY[]::UUID[]))
  ORDER BY brief.lead_id, brief.created_at DESC, brief.id DESC
$function$;
REVOKE ALL ON FUNCTION public.get_latest_lead_ai_briefs(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_latest_lead_ai_briefs(UUID[]) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.create_n8n_lead_message_with_ai_brief(
  p_source TEXT,
  p_external_id TEXT,
  p_normalized_phone TEXT,
  p_existing_lead_id UUID,
  p_existing_person_id UUID,
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_country TEXT,
  p_message_text TEXT,
  p_attachments JSONB,
  p_raw_payload JSONB,
  p_received_at TIMESTAMPTZ,
  p_new_case_fields JSONB,
  p_ai_brief JSONB DEFAULT NULL
)
RETURNS TABLE (lead_id UUID, created BOOLEAN)
LANGUAGE PLPGSQL
SET search_path = public
AS $function$
DECLARE
  v_lead_id UUID;
  v_created BOOLEAN;
BEGIN
  IF p_new_case_fields->>'status' IS DISTINCT FROM 'new'
     OR p_new_case_fields->>'workflow_stage' IS DISTINCT FROM 'lead_captured'
     OR p_new_case_fields->>'urgency' IS DISTINCT FROM 'medium'
     OR p_new_case_fields->>'decision_status' IS DISTINCT FROM 'pending'
     OR p_new_case_fields->>'lead_source' IS DISTINCT FROM p_source
     OR p_new_case_fields->>'coordinator_id' IS NOT NULL
     OR p_new_case_fields->>'is_demo' IS DISTINCT FROM 'false'
     OR p_new_case_fields->>'enquiry_date' IS NULL THEN
    RAISE EXCEPTION 'Invalid new lead defaults';
  END IF;

  SELECT result.lead_id, result.created
    INTO v_lead_id, v_created
    FROM public.create_n8n_lead_message_with_case_fields(
      p_source,
      p_external_id,
      p_normalized_phone,
      p_existing_lead_id,
      p_existing_person_id,
      p_name,
      p_phone,
      p_email,
      p_country,
      p_message_text,
      p_attachments,
      p_raw_payload,
      p_received_at,
      p_new_case_fields
    ) AS result;

  IF p_ai_brief IS NOT NULL THEN
    INSERT INTO public.lead_ai_briefs (
      lead_id, seriousness, seriousness_reason, temperature, score, summary,
      key_findings, likely_specialty, suggested_hospitals, missing_info,
      talking_points, questions_to_ask, red_flags, residence_confirmed,
      language, generated_at
    ) VALUES (
      v_lead_id,
      p_ai_brief->>'seriousness',
      p_ai_brief->>'seriousness_reason',
      p_ai_brief->>'temperature',
      (p_ai_brief->>'score')::DOUBLE PRECISION,
      p_ai_brief->>'summary',
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_ai_brief->'key_findings')), '{}'),
      p_ai_brief->>'likely_specialty',
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_ai_brief->'suggested_hospitals')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_ai_brief->'missing_info')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_ai_brief->'talking_points')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_ai_brief->'questions_to_ask')), '{}'),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_ai_brief->'red_flags')), '{}'),
      (p_ai_brief->>'residence_confirmed')::BOOLEAN,
      p_ai_brief->>'language',
      (p_ai_brief->>'generated_at')::TIMESTAMPTZ
    );
  END IF;

  RETURN QUERY SELECT v_lead_id, v_created;
END;
$function$;
REVOKE ALL ON FUNCTION public.create_n8n_lead_message_with_ai_brief(TEXT, TEXT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TIMESTAMPTZ, JSONB, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_n8n_lead_message_with_ai_brief(TEXT, TEXT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TIMESTAMPTZ, JSONB, JSONB) TO service_role;