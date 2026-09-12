# Meta Test WhatsApp Diagnostic

**Recorded:** 2026-09-12 09:34 UTC (15:04 Calcutta, UTC+5:30)

## Scope

Two read-only Meta Graph API v25.0 checks were performed using the securely stored Meta-generated test access token. The token value was not displayed or logged.

No message was sent. No phone number was registered. No credentials, webhooks, subscriptions, WhatsApp Business Accounts, or phone-number assets were modified.

## Test assets

- Test WABA ID: `1756087398930781`
- Test Phone Number ID: `1280075035189892`
- Test phone: `+1 555 673-4183`

## Results

### Test Phone Number ID

Request: `GET https://graph.facebook.com/v25.0/1280075035189892`

- HTTP status: `400`
- Error type: `GraphMethodException`
- Meta error code: `100`
- Meta error subcode: `33`
- Message: `Unsupported get request. Object with ID '1280075035189892' does not exist, cannot be loaded due to missing permissions, or does not support this operation. Please read the Graph API documentation at https://developers.facebook.com/docs/graph-api`
- Meta trace ID: `Ael5JZ7rSyv8BWXmYFAh6H9`

### Test WABA Phone Numbers

Request: `GET https://graph.facebook.com/v25.0/1756087398930781/phone_numbers`

- HTTP status: `400`
- Error type: `GraphMethodException`
- Meta error code: `100`
- Meta error subcode: `33`
- Message: `Unsupported get request. Object with ID '1756087398930781' does not exist, cannot be loaded due to missing permissions, or does not support this operation. Please read the Graph API documentation at https://developers.facebook.com/docs/graph-api`
- Meta trace ID: `AGXWrf6yQT7Fpl-Jk6HMNtK`

## Production assets explicitly untouched

- Production WABA ID: `1003235299095695`
- Production Phone Number ID: `1103142389558693`
- Production access token
- WhatsApp webhook
- WABA app subscription

## Hold instruction

All Meta API testing is paused until explicitly resumed. Do not make further Meta requests, register the test phone, or modify production WhatsApp credentials or assets.