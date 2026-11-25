CREATE OR REPLACE FUNCTION public.create_n8n_lead_message_with_case_fields(
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
  p_new_case_fields JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (lead_id UUID, created BOOLEAN)
LANGUAGE plpgsql
SET search_path = public
AS $function$
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

  RETURN QUERY
  SELECT result.lead_id, result.created
    FROM public.create_n8n_lead_message(
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
      p_received_at
    ) AS result;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_n8n_lead_message_with_case_fields(TEXT, TEXT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TIMESTAMPTZ, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_n8n_lead_message_with_case_fields(TEXT, TEXT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TIMESTAMPTZ, JSONB) TO service_role;