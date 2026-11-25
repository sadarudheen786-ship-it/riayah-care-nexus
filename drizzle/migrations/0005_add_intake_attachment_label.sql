ALTER TABLE public.lead_intake_attachments
  ADD COLUMN attachment_type TEXT NOT NULL DEFAULT 'report';