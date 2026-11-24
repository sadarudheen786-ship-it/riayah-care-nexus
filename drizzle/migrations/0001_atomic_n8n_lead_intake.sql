CREATE OR REPLACE FUNCTION public.create_n8n_lead_message(
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
  p_received_at TIMESTAMPTZ
)
RETURNS TABLE (lead_id UUID, created BOOLEAN)
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  v_lead_id UUID;
  v_person_id UUID;
  v_created BOOLEAN := FALSE;
  v_name TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  IF p_source NOT IN ('instagram', 'facebook', 'whatsapp', 'website', 'lead_ad', 'email') THEN
    RAISE EXCEPTION 'Unsupported lead source';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('riayah:n8n:sender:' || p_source || ':' || p_external_id, 0));
  IF p_normalized_phone IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('riayah:n8n:phone:' || p_normalized_phone, 0));
  END IF;

  SELECT lm.lead_id
    INTO v_lead_id
    FROM public.lead_messages AS lm
   WHERE (lm.source = p_source AND lm.external_id = p_external_id)
      OR (p_normalized_phone IS NOT NULL AND lm.normalized_phone = p_normalized_phone)
   ORDER BY CASE WHEN lm.source = p_source AND lm.external_id = p_external_id THEN 0 ELSE 1 END,
            lm.created_at DESC
   LIMIT 1;

  IF v_lead_id IS NOT NULL THEN
    SELECT c.person_id INTO v_person_id
      FROM public.cases AS c
     WHERE c.id = v_lead_id;
  ELSIF p_existing_lead_id IS NOT NULL THEN
    SELECT c.id, c.person_id
      INTO v_lead_id, v_person_id
      FROM public.cases AS c
     WHERE c.id = p_existing_lead_id
       AND c.deleted_at IS NULL;
  END IF;

  IF v_lead_id IS NULL THEN
    IF p_existing_person_id IS NOT NULL THEN
      SELECT p.id INTO v_person_id
        FROM public.persons AS p
       WHERE p.id = p_existing_person_id
         AND p.deleted_at IS NULL;
    END IF;

    IF v_person_id IS NULL THEN
      v_name := NULLIF(BTRIM(p_name), '');
      v_first_name := CASE WHEN v_name IS NULL THEN 'Unknown' ELSE SPLIT_PART(v_name, ' ', 1) END;
      v_last_name := NULLIF(BTRIM(SUBSTRING(v_name FROM LENGTH(v_first_name) + 1)), '');

      INSERT INTO public.persons (
        first_name, last_name, primary_phone, whatsapp_number, email,
        country_of_residence, is_demo
      ) VALUES (
        v_first_name, v_last_name, NULLIF(BTRIM(p_phone), ''),
        CASE WHEN p_source = 'whatsapp' THEN NULLIF(BTRIM(p_phone), '') ELSE NULL END,
        NULLIF(BTRIM(p_email), ''), NULLIF(BTRIM(p_country), ''), FALSE
      )
      RETURNING id INTO v_person_id;
    ELSE
      UPDATE public.persons AS p
         SET primary_phone = COALESCE(NULLIF(BTRIM(p.primary_phone), ''), NULLIF(BTRIM(p_phone), '')),
             whatsapp_number = COALESCE(
               NULLIF(BTRIM(p.whatsapp_number), ''),
               CASE WHEN p_source = 'whatsapp' THEN NULLIF(BTRIM(p_phone), '') ELSE NULL END
             ),
             email = COALESCE(NULLIF(BTRIM(p.email), ''), NULLIF(BTRIM(p_email), '')),
             country_of_residence = COALESCE(NULLIF(BTRIM(p.country_of_residence), ''), NULLIF(BTRIM(p_country), ''))
       WHERE p.id = v_person_id;
    END IF;

    INSERT INTO public.cases (
      person_id, status, workflow_stage, urgency, decision_status,
      lead_source, coordinator_id, enquiry_date, is_demo
    ) VALUES (
      v_person_id, 'new', 'lead_captured', 'medium', 'pending',
      p_source::public.lead_source, NULL,
      (p_received_at AT TIME ZONE 'UTC')::date, FALSE
    )
    RETURNING id INTO v_lead_id;
    v_created := TRUE;
  ELSE
    UPDATE public.persons AS p
       SET primary_phone = COALESCE(NULLIF(BTRIM(p.primary_phone), ''), NULLIF(BTRIM(p_phone), '')),
           whatsapp_number = COALESCE(
             NULLIF(BTRIM(p.whatsapp_number), ''),
             CASE WHEN p_source = 'whatsapp' THEN NULLIF(BTRIM(p_phone), '') ELSE NULL END
           ),
           email = COALESCE(NULLIF(BTRIM(p.email), ''), NULLIF(BTRIM(p_email), '')),
           country_of_residence = COALESCE(NULLIF(BTRIM(p.country_of_residence), ''), NULLIF(BTRIM(p_country), ''))
     WHERE p.id = v_person_id;
  END IF;

  INSERT INTO public.lead_messages (
    lead_id, source, external_id, normalized_phone, direction, text,
    attachments, raw_payload, received_at
  ) VALUES (
    v_lead_id, p_source, p_external_id, p_normalized_phone, 'inbound', p_message_text,
    COALESCE(p_attachments, '[]'::jsonb), COALESCE(p_raw_payload, '{}'::jsonb), p_received_at
  );

  UPDATE public.cases
     SET updated_at = now()
   WHERE id = v_lead_id;

  RETURN QUERY SELECT v_lead_id, v_created;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_n8n_lead_message(TEXT, TEXT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_n8n_lead_message(TEXT, TEXT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TIMESTAMPTZ) TO service_role;