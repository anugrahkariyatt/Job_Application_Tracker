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

# Installation & Setup

## Option 1: Quick Start with Docker (Recommended)

Run the entire application (Next.js Client, Express Server, MongoDB, Redis, and n8n) with a single command:

### 1. Clone the Repository

```bash
git clone https://github.com/anugrahkariyatt/Job_Application_Tracker.git
cd Job_Application_Tracker
```

### 2. Configure Environment Variables

Create `.env` files in both `server/` and `client/` directories:

- **Server**: Create `server/.env` (see template below)
- **Client**: Create `client/.env` (see template below)

### 3. Start All Containers

```bash
docker compose up --build -d
```

### 4. Access the Services

| Service              | URL                                            | Description            |
| :------------------- | :--------------------------------------------- | :--------------------- |
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | Next.js Client         |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Express.js API         |
| **n8n Automation**   | [http://localhost:5678](http://localhost:5678) | Workflow Engine Editor |
| **MongoDB**          | `localhost:27017`                              | Database Container     |
| **Redis**            | `localhost:6380`                               | In-Memory Cache Store  |

### Useful Docker Commands

```bash
# View live logs for all services
docker compose logs -f

# View live logs for server only
docker compose logs -f server

# Stop all containers (data is safely preserved in Docker volumes)
docker compose down

# Rebuild containers after code modifications
docker compose up --build -d
```

---

## Option 2: Manual Local Setup (Without Docker)

### 1. Backend Setup

```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 3. n8n Automation Setup

1. Install and start n8n: `npx n8n`
2. Import the workflow from the `n8n/` directory.
3. Configure your Brevo credentials and activate the workflow.

---

# Environment Variables

## Server (`server/.env`)

```env
CLIENT_URL=http://localhost:3000

MONGODB_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ACCESS_TOKEN_SECRET=your-access-token-secret

REFRESH_TOKEN_SECRET=your-refresh-token-secret

PASSWORD_VERIFICATION_SECRET=your-password-vefification-token-secret

PASSWORD_RESET_TOKEN_SECRET=your-password-reset-token-secret

EMAIL_VERIFICATION_TOKEN_SECRET=your_secret_here

EMAIL_USER=
EMAIL_PASS=


N8N_WEBHOOK_URL=http://localhost:5678/webhook
#https://n8n-service-production-e73d.up.railway.app/webhook
# http://localhost:5678/webhook

STRIPE_SECRET_KEY=

GOOGLE_CLIENT_ID=

GEMINI_API_KEY=


cronSecret=

N8N_WEBHOOK_SECRET=your_super_secret_webhook_key_2026

REDIS_URL=redis://127.0.0.1:6380

```

## Client (`client/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

# Available Scripts

## Client

```bash
npm run dev     # Start Next.js development server
npm run build   # Build production Next.js bundle
npm run start   # Start production Next.js server
npm run lint    # Run ESLint checks
```

## Server

```bash
npm run dev     # Start development server with nodemon / tsx
npm run build   # Compile TypeScript to dist/
npm run start   # Start compiled production server
```

---

# Future Enhancements

- [x] Docker & Docker Compose Multi-Container Orchestration
- [x] Redis Caching & In-Memory Store
- [x] AI Resume Review & Match Scoring (Gemini AI)
- [ ] WebSocket Real-Time Notifications
- [ ] AI Personalized Job Recommendations
- [ ] Automated Interview Scheduling

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
