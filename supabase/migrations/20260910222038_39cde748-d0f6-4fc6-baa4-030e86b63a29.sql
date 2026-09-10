CREATE TABLE public.whatsapp_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waba_id text NOT NULL,
  waba_name text,
  waba_status text,
  phone_number_id text,
  display_phone_number text,
  verified_name text,
  platform_type text,
  phone_status text,
  code_verification_status text,
  coexistence boolean NOT NULL DEFAULT false,
  connection_status text NOT NULL DEFAULT 'connected',
  last_error text,
  connected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  connected_at timestamptz NOT NULL DEFAULT now(),
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (waba_id, phone_number_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_connections TO authenticated;
GRANT ALL ON public.whatsapp_connections TO service_role;

ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view whatsapp connections"
  ON public.whatsapp_connections FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

CREATE POLICY "Staff can manage whatsapp connections"
  ON public.whatsapp_connections FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_whatsapp_connections_updated_at
  BEFORE UPDATE ON public.whatsapp_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();