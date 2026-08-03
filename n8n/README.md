# Nuvora Email Automation (n8n)

This folder contains the exported **n8n workflow** used by the Nuvora Job Application Tracker.

The workflow centralizes all email automation and scheduled background tasks into a single workflow. The backend communicates with n8n through a single webhook endpoint, where requests are routed to the appropriate email template using a Switch node.

---

## Features

This workflow currently handles:

- Email Verification
- Forgot Password
- Application Submitted
- Application Status Updated
- Job Alert Notification
- Company New Job Notification
- Interview Scheduled
- Interview Cancelled
- Payment Success
- Contact Form Auto Reply
- New Company Registration Notification
- Scheduled Daily Job Alerts
- Scheduled Weekly Job Alerts
- Scheduled Monthly Job Alerts

---

## Workflow Overview

```text
Backend API
      │
      ▼
   n8n Webhook
      │
      ▼
 Switch Node
      │
      ├── Verification Email
      ├── Forgot Password
      ├── Application Submitted
      ├── Application Status
      ├── Job Alert
      ├── Company Notification
      ├── Interview Scheduled
      ├── Interview Cancelled
      ├── Payment Success
      ├── Contact Form
      └── New Company

Schedule Triggers
      │
      ├── Daily
      ├── Weekly
      └── Monthly
             │
             ▼
      Backend Scheduled Job API
```

---

# Email Service

All emails are delivered using the **Brevo Transactional Email API** via HTTP Request nodes.

---

# Required Environment Variables

Create the following environment variables in your n8n deployment.

```env
BREVO_API_KEY=

SENDER_EMAIL=

API_URL=

CRON_SECRET=
```

| Variable | Description |
|----------|-------------|
| `BREVO_API_KEY` | Brevo API Key used for sending emails |
| `SENDER_EMAIL` | Verified sender email in Brevo |
| `API_URL` | Backend API base URL |
| `CRON_SECRET` | Secret used to authenticate scheduled requests |

---

# Import Workflow

1. Open your n8n instance.
2. Click **Import from File**.
3. Select `Nuvora Email Service.json`.
4. Configure the required environment variables.
5. Activate the workflow.

---

# Webhook Endpoint

The backend sends email requests to the workflow webhook.

Example payload:

```json
{
  "type": "verification",
  "email": "user@example.com",
  "verificationLink": "https://example.com/verify"
}
```

The `type` field determines which email template will be executed.

Supported types include:

- verification
- forgot-password
- application-submitted
- application-status-updated
- job-alert
- company-new-job
- interview-scheduled
- interview-cancelled
- payment-success
- scheduled-job-alert
- contact-form-submitted
- new-company

---

# Scheduled Automation

The workflow includes built-in schedule triggers that automatically process:

- Daily Job Alerts
- Weekly Job Alerts
- Monthly Job Alerts

Each scheduled trigger securely calls the backend using the configured `API_URL` and `CRON_SECRET`.

---

#Technologies

- n8n
- Brevo Email API
- HTTP Request Nodes
- Webhook Nodes
- Schedule Trigger Nodes
- Switch Node
- Environment Variables

---

# Notes

- API keys and secrets are loaded from environment variables.
- No credentials are stored in the exported workflow.
- The workflow is safe to version-control and share publicly.