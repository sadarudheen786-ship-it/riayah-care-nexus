CREATE OR REPLACE FUNCTION public.create_n8n_lead_message_with_ai_brief(
  p_source TEXT DEFAULT NULL,
  p_external_id TEXT DEFAULT NULL,
  p_normalized_phone TEXT DEFAULT NULL,
  p_existing_lead_id UUID DEFAULT NULL,
  p_existing_person_id UUID DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_message_text TEXT DEFAULT NULL,
  p_attachments JSONB DEFAULT '[]'::jsonb,
  p_raw_payload JSONB DEFAULT '{}'::jsonb,
  p_received_at TIMESTAMPTZ DEFAULT NULL,
  p_new_case_fields JSONB DEFAULT '{}'::jsonb,
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