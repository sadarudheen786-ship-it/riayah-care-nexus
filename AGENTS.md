<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- External n8n intake stores leads in `public.cases` and inbound history in `public.lead_messages` keyed by case ID; use `/api/public/*` as the published entry point and `/api/intake/lead` as its alias. Append each AI brief to case history and store reports in the private `patient-intake` bucket with staff-only metadata and signed links, preserving history without exposing source URLs.
- Keep browser-rendered app pages behind the root auth check while leaving `/api/*` server routes to handler-level security; attach Supabase bearer tokens to server functions through the existing start middleware.
