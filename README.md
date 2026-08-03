# Job Application Tracker

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)


A modern **full-stack Job Application Tracker** built with **Next.js, Express.js, MongoDB, and TypeScript**. The platform enables candidates to discover and apply for jobs, recruiters to manage job postings and applicants, and administrators to oversee the platform.

---

# Features

## Candidate
- Secure Email & Google Authentication
- Complete Candidate Profile
- Search & Filter Jobs
- Save Jobs
- Apply for Jobs
- Track Application Status
- Company Subscriptions
- Personalized Job Alerts
- Notifications
- Dashboard

## Recruiter
- Company Profile Management
- Create, Update & Delete Jobs
- View Applicants
- Manage Applications
- Recruiter Dashboard

## Admin
- Dashboard
- User Management
- Company Management
- Job Management
- Verification & Moderation
- Notifications
- Platform Settings

---

# Tech Stack

## Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Redux Toolkit
- React Hook Form
- Zod
- Axios
- Material UI
- Radix UI
- Lucide React

## Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Google OAuth
- Cloudinary
- Multer
- Zod Validation

## Automation

- n8n
- Brevo Transactional Email API

---

# Folder Structure

```text
job-application-tracker
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── providers/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validations/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
├── n8n/
│   ├── Nuvora Email Service.json
│   └── README.md
│
├── README.md
└── .gitignore
```

---

# Authentication

- Email & Password Login
- Google OAuth Login
- JWT Access Token
- JWT Refresh Token
- HTTP-only Cookies
- Role-Based Authorization
- Protected Routes
---
# Workflow Automation

This project integrates **n8n** for background automation and transactional email processing.

The exported workflow is available in the `n8n/` directory.

### Current Automations

- Email Verification
- Password Reset
- Application Submitted
- Application Status Updates
- Job Alerts
- Company Notifications
- Interview Notifications
- Payment Success Emails
- Contact Form Auto Replies
- New Company Registration Notifications
- Daily / Weekly / Monthly Scheduled Job Alerts

For setup instructions, see the `n8n/README.md` file.

---

# Application Flow

```text
Candidate
    │
    ▼
Register / Login
    │
    ▼
Complete Profile
    │
    ▼
Browse Jobs
    │
    ▼
Apply
    │
    ▼
Track Application
```

---

# Installation

## Clone

```bash
git clone https://github.com/<your-username>/job-application-tracker.git
cd job-application-tracker
```

## Backend

```bash
cd server
npm install
npm run dev
```

## Frontend

```bash
cd client
npm install
npm run dev
```

## n8n

1. Import the workflow from the `n8n/` directory.
2. Configure the required environment variables.
3. Activate the workflow.
4. Update the backend webhook URL if necessary.

---

# Environment Variables

## Server (.env)

```env
PORT=
NODE_ENV=
CLIENT_URL=
MONGODB_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Client (.env.local)

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

## n8n (.env)

```env
BREVO_API_KEY=
SENDER_EMAIL=
API_URL=
CRON_SECRET=
```

---

# Available Scripts

## Client

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Server

```bash
npm run dev
npm run build
npm run start
```

---

# Future Enhancements

- Docker & Docker Compose
- Redis Caching
- BullMQ Queue
- WebSocket Notifications
- AI Resume Review
- AI Job Recommendations
- Interview Scheduling
- Resume Parsing

---

# Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# License

This project is licensed under the MIT License.

---

# Author

**Anugrah K**

- GitHub: https://github.com/anugrahkariyatt
- LinkedIn: https://www.linkedin.com/in/anugrahkariyatt/

---

## Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
