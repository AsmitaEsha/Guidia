# Trusted people (guardians)

A guardian is a helper, not an administrator. The senior decides who helps them and what each person can see, and can change or end that at any time.

## Connection

1. The senior invites someone by email (Trusted people → *Add a trusted person*). If that email already has a Guidia account, the person gets an in-app notification, plus an email when SMTP is configured. Otherwise an invitation email is queued.
2. Nothing is shared until the invited person signs in **with that email** and accepts.
3. Either side can end the connection at any time. Pending approvals expire and the other side is told.

## Permission scopes

| Scope | What the guardian gets |
|---|---|
| `EMERGENCY_ALERTS` | "I need help" alerts (always emailed when SMTP is configured) |
| `APPROVAL_REQUESTS` | Requests to approve practice payments at or above the senior's chosen amount |
| `SAFETY_ALERTS` | **Counts** of risky messages checked in the last 30 days, never the messages themselves |
| `LEARNING_PROGRESS` | Skills and mastery levels, lessons completed |
| `TASK_ACTIVITY` | The task the senior is working on right now |
| `MEMORY_BOOK` | Titles of saved Memory Book entries |
| `PRIVATE_CONVERSATIONS`, `FINANCIAL_DETAILS` | Defined for the future, not granted by default and not exposed anywhere yet |

Defaults on invite are `EMERGENCY_ALERTS`, `APPROVAL_REQUESTS` and `SAFETY_ALERTS`. Every permission change is visible to the senior (a notification), audited, and also reported to the guardian.

Guardians can never see passwords, PINs, OTPs or conversations. They can't change the senior's security settings or permissions, and they can't execute actions outside the approval flow.

## Approvals

The Safety Engine requires guardian approval for a practice payment when the senior has an ACTIVE guardian with `APPROVAL_REQUESTS` **and** either:

- the amount is at or above that guardian's threshold, or
- the action is CRITICAL (for example a very large amount).

The guardian sees the app, the amount (marked as practice), the recipient label and the time. They can **Approve**, choose **Let's talk first** (FLAGGED, which stops the action) or **Decline**. Exactly one decision applies, even if two arrive at once. The senior's screen updates on its own, and the senior is notified.

## Emergencies

`POST /emergency` takes a reason (`I_AM_CONFUSED`, `I_THINK_THIS_IS_UNSAFE`, `I_MAY_HAVE_MADE_A_MISTAKE`, `PAYMENT_HELP`, `APPOINTMENT_HELP`, `OTHER`) and an optional note, which is redacted.

- Every guardian with `EMERGENCY_ALERTS` receives a CRITICAL notification and an email, written in the same transaction as the event.
- A repeat press within 10 minutes returns the same event, so guardians aren't spammed.
- The status moves TRIGGERED → SENT → ACKNOWLEDGED → CONTACTED → RESOLVED, or CANCELLED. When nobody is connected it stays **TRIGGERED** and the senior is told plainly that nobody was notified.
- The page tells the senior to call local emergency services for real danger. Guidia does not contact authorities.

## Notification policy

| Severity | Delivery |
|---|---|
| CRITICAL (emergencies) | In-app and email, always |
| HIGH (approval requests, invites) | In-app, and email if the recipient keeps email notifications on |
| MEDIUM / LOW | In-app only |

A dedupe key per notification stops repeats. Email goes through the outbox and worker with exponential backoff (up to 6 attempts). Without SMTP the email is recorded as `SKIPPED`, and the notification says "email not set up".
