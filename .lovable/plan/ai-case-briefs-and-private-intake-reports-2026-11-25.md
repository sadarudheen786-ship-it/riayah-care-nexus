# AI Case Briefs and Private Intake Reports

## Build
- Extend the n8n payload validator with the optional structured `ai_brief` object and keep each received brief as an append-only case history; make the newest brief available to the Leads list and detail view.
- Store inbound reports in the existing private `patient-intake` storage bucket. Fetch only bounded, HTTPS, non-redirecting report URLs; save file metadata against the lead and remove raw attachment URLs from the message attachment field.
- Add staff-only read access for brief and attachment metadata, and issue short-lived file links only through authenticated server functions.
- Add the internal-only brief panel, red flags first, seriousness/temperature chips, report viewer/download controls, list columns and filters, and default Critical + Hot-first sorting.
- Add focused tests for payload validation and lead ordering; verify authentication, storage access, and UI behavior.

## Technical details
- Apply one additive migration for an append-only `lead_ai_briefs` table, `lead_intake_attachments` metadata, the authenticated latest-brief lookup, and a service-role-only intake RPC that records the brief atomically with its message.
- Keep all writes to briefs/files server-only; staff can read through existing staff RLS rules. Use the existing private bucket and its current staff-only policies without changing bucket configuration.
- Keep the current public n8n endpoint and its alias unchanged.