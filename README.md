# 🚀 Job Application & Recruitment Portal (Full-Stack)

A modern, full-stack Job Application and Recruitment platform built with **Next.js 16**, **React 19**, **Node.js**, **Express**, **TypeScript**, and **MongoDB**. Designed with a feature-based architecture, Role-Based Access Control (RBAC), AI integration, real-time notifications, and email alerts.

---

## 🛠️ Tech Stack & Architecture

### **Frontend (`/client`)**
- **Framework:** Next.js 16 (App Router, React 19)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Styling & UI:** Tailwind CSS v4, Radix UI / Shadcn components, Lucide Icons, Material UI
- **Form & Validation:** React Hook Form, Zod
- **Authentication:** Axios interceptors, `@react-oauth/google`

### **Backend (`/server`)**
- **Runtime & Framework:** Node.js, Express.js (ES Modules, TypeScript)
- **Database & ORM:** MongoDB, Mongoose
- **Authentication & Security:** JWT (Access & Refresh tokens), Bcrypt, Role Middleware
- **Services & Integrations:**
  - **AI:** `@google/genai` (Gemini API for resume matching / candidate insights)
  - **Media & Files:** Cloudinary, Multer
  - **Payments:** Stripe
  - **Mailing:** Nodemailer / Mail Service
  - **OAuth:** Google Auth Library

---

## 📁 Repository Structure

```text
Job-application/
├── client/                   # Next.js Frontend Application
│   ├── src/
│   │   ├── app/              # Next.js App Router (Pages, Layouts, Dashboards)
│   │   ├── components/       # Reusable UI components
│   │   ├── features/         # Feature-based domain modules (auth, jobs, etc.)
│   │   │   └── auth/         # Auth API services, AuthInitializer, ProtectedRoute, RoleGuard
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Axios configuration & utility functions
│   │   ├── store/            # Redux Toolkit store & slices
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets & public media
│   └── package.json
│
├── server/                   # Express.js REST API Backend
│   ├── src/
│   │   ├── config/           # Database & environment configurations
│   │   ├── controllers/      # Route handler controllers (auth, job, application, etc.)
│   │   ├── middleware/       # Express middleware (auth, role authorization, upload)
│   │   ├── models/           # Mongoose schemas & data models
│   │   ├── routes/           # Express API endpoints
│   │   ├── services/         # Business logic services (job, subscription, mail, etc.)
│   │   ├── types/            # Server TypeScript interfaces
│   │   └── utils/            # JWT utils, AppError, logger helpers
│   └── package.json
│
└── README.md                 # Project Root Documentation
```

---

## ✨ Key Features

### 👤 **Role-Based Workflows**
1. **Candidate:** Profile creation, resume uploads, searching jobs, applying with customized answers, subscribing to company updates, managing job alerts.
2. **Recruiter:** Company profile setup, posting/editing jobs, reviewing candidate applications, scheduling interviews, sending notifications.
3. **Admin:** System dashboard, platform settings management, user role moderation, platform analytics.

### 🔒 **Security & Authentication**
- Dual JWT auth flow (Short-lived Access Tokens + HttpOnly Refresh Tokens).
- Google OAuth Integration for seamless login/registration.
- Password hashing with Bcrypt.
- Protected routes with `AuthInitializer`, `ProtectedRoute`, and `RoleGuard` on the frontend.

### 🔔 **Job Alerts & Company Subscriptions**
- Candidates can follow specific companies to receive instant email and in-app notifications whenever a new job is posted.
- Automated de-duplication between Job Alerts and Company Subscriptions.

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **yarn**
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URL

---

### 2. Environment Setup

#### **Backend (`server/.env`)**
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/job-application
JWT_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_google_genai_key
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:3000
```

#### **Frontend (`client/.env.local`)**
Create a `.env.local` file in the `client/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

### 3. Installation & Local Development

#### **Run Backend Server:**
```bash
cd server
npm install
npm run dev
```
The backend API server will run on `http://localhost:5000`.

#### **Run Frontend Client:**
```bash
cd client
npm install
npm run dev
```
The frontend web application will run on `http://localhost:3000`.

---

## 📜 NPM Scripts

### **Server Scripts (`/server`)**
- `npm run dev`: Runs the backend server in development watch mode using `tsx`.
- `npm run build`: Compiles TypeScript down to JavaScript in the `dist/` directory.
- `npm run start`: Runs the production JavaScript build from `dist/server.js`.

### **Client Scripts (`/client`)**
- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the production-ready Next.js web application.
- `npm run start`: Starts the production Next.js server.
- `npm run lint`: Runs ESLint checks.
