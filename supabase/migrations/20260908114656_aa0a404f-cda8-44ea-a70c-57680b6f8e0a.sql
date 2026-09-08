ALTER TABLE public.communications
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_message_type TEXT,
  ADD COLUMN IF NOT EXISTS message_status TEXT,
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS provider_payload JSONB;

CREATE INDEX IF NOT EXISTS idx_comm_provider_message_id ON public.communications(provider, external_message_id);
CREATE INDEX IF NOT EXISTS idx_comm_message_status ON public.communications(message_status) WHERE message_status IS NOT NULL;