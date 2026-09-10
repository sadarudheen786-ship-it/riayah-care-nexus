# Fix WhatsApp Embedded Signup Completion

## Goal
Make the existing Meta Coexistence signup reliably capture its successful completion and persist the existing WABA/phone connection, without changing Meta assets, credentials, webhooks, or configuration IDs.

## Changes
- Harden the browser callback handler to accept Meta's supported message shapes and record `FINISH`, `FINISH_ONLY_WABA`, and cancellation outcomes.
- Coordinate the Facebook Login callback with the Embedded Signup event instead of immediately treating a late event as failure.
- Initialize the Meta SDK consistently and surface safe, non-secret failure details when Meta returns no usable completion data.
- Keep the current server-side persistence and live status refresh; submit only the existing WABA/phone IDs returned by Meta.

## Verification
- Run the focused type check.
- Verify the Integration Hub loads the existing connection and its controls remain responsive.
- Do not launch Meta signup during verification or make any Meta-side changes.
