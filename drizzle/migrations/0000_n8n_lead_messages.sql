ALTER TYPE public.intake_channel ADD VALUE IF NOT EXISTS 'lead_ad';
ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'lead_ad';

CREATE TABLE public.lead_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('instagram', 'facebook', 'whatsapp', 'website', 'lead_ad', 'email')),
  external_id TEXT NOT NULL,
  normalized_phone TEXT,
  direction TEXT NOT NULL DEFAULT 'inbound' CHECK (direction = 'inbound'),
  text TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.lead_messages TO authenticated;
GRANT ALL ON public.lead_messages TO service_role;
REVOKE ALL ON public.lead_messages FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.lead_messages FROM authenticated;
ALTER TABLE public.lead_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read lead messages" ON public.lead_messages
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

CREATE INDEX idx_lead_messages_lead_received ON public.lead_messages(lead_id, received_at DESC);
CREATE INDEX idx_lead_messages_source_external ON public.lead_messages(source, external_id);
CREATE INDEX idx_lead_messages_normalized_phone ON public.lead_messages(normalized_phone) WHERE normalized_phone IS NOT NULL;
CREATE INDEX idx_lead_messages_created_at ON public.lead_messages(created_at DESC);