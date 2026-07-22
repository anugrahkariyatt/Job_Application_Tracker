# Implementation Plan - Job Application Tracker

This implementation plan outlines the steps required to complete the basic requirements and add the optional enhancements to the Job Application Tracker application.

## State Assessment & Gap Analysis

Based on our analysis of the codebase, we found the following:
* **Basic Requirements Status**:
  * **User Authentication**: Fully implemented (registration, login, verify, forgot password).
  * **Company/Job Management**: Recruiters can manage their company profiles and jobs, but **Admin controls are incomplete**.
  * **Search & Filters**: Fully implemented with debouncing and multiple search criteria.
  * **Job Application Tracking**: Candidates can apply and track statuses, but **application-specific notes/related documents tracking is missing**.
  * **Subscriptions & Custom Job Alerts**: Fully implemented on both back-end and front-end (notifying matching users on new job post).
* **Optional Enhancements Status**:
  * **Interview Scheduler**: **Completely Missing** (currently uses mocked UI data).
  * **Social Share Integration**: **Completely Missing**.
  * **Remote Job Filter**: Fully implemented as a checkbox, but needs Google Location Autocomplete or an improved layout.

---

## User Review Required

> [!IMPORTANT]
> To support the **Admin privileges to create company profiles**, we need a clean workflow. A company profile requires an owner user (`ownerId` pointing to a recruiter user). In our Admin panel, we will fetch users with the role `recruiter` and let the Admin select who will own the company. Alternatively, we can let the Admin register a company and automatically create/assign it. The dropdown selection is recommended.

---

## Open Questions

None at this stage. We have structured a self-contained and clean design that fully covers all points.

---

## Proposed Changes

### Database & Input Validation Layer

#### [MODIFY] [application.model.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/models/application.model.ts)
* Add `notes: { type: String, default: "" }` to the mongoose schema.
* Update `IApplication` interface definition.

#### [NEW] [interview.model.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/models/interview.model.ts)
* Create schema for scheduled interviews.
* Fields: `applicationId`, `candidateId`, `jobId`, `companyId`, `title`, `dateTime`, `duration` (minutes), `locationType` ("Online" | "Onsite"), `link` (meeting link), `location` (onsite address), `status` ("Scheduled" | "Completed" | "Cancelled"), `notes`.

#### [MODIFY] [admin.validation.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/validations/admin.validation.ts)
* Add Zod validation schemas for:
  * `createCompanyByAdminSchema` (requires name, industry, ownerId)
  * `updateCompanyByAdminSchema` (optional name, industry, website, headquarters, description, etc.)
  * `createJobByAdminSchema` (requires companyId, title, description, requirements, responsibilities, skills, employmentType, experienceLevel, salaryMin, salaryMax, location, remote, vacancies, applicationDeadline, status)
  * `updateJobByAdminSchema` (same as above but all fields optional)

#### [NEW] [interview.validation.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/validations/interview.validation.ts)
* Add validation schema for scheduling interviews.

---

### Backend Service & Route Controllers Layer

#### [MODIFY] [admin.service.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/services/admin.service.ts)
* Add business logic for:
  * `createCompanyByAdmin(data, ownerId)`
  * `updateCompanyByAdmin(companyId, data)`
  * `createJobByAdmin(data)` (takes explicit companyId and posts)
  * `updateJobByAdmin(jobId, data)`

#### [NEW] [interview.service.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/services/interview.service.ts)
* Handle DB interactions for scheduling, editing, retrieving interviews for candidate/recruiter.

#### [MODIFY] [admin.controller.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/controllers/admin.controller.ts)
* Implement controllers for company/job creation & update.

#### [MODIFY] [admin.route.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/routes/admin.route.ts)
* Mount the endpoints:
  * `POST /api/admin/companies`
  * `PATCH /api/admin/companies/:companyId`
  * `POST /api/admin/jobs`
  * `PATCH /api/admin/jobs/:jobId`

#### [NEW] [interview.controller.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/controllers/interview.controller.ts)
* Define Express controllers for handling interview actions.

#### [NEW] [interview.routes.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/routes/interview.routes.ts)
* Define Express routing for `/api/interviews`.

#### [MODIFY] [app.ts](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/server/src/app.ts)
* Register `/api/interviews` routing.

---

### Frontend Client Pages & UI (Dashboard Controls)

#### [NEW] [new/page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/admin/companies/new/page.tsx)
* Form for Admin to create a new company. Includes a dropdown to choose a Recruiter user as owner (fetched from `/api/admin/users?role=recruiter`).

#### [NEW] [edit/page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/admin/companies/[id]/edit/page.tsx)
* Form for Admin to edit company details.

#### [NEW] [new/page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/admin/jobs/new/page.tsx)
* Form for Admin to post a job listing under any company (fetched via dropdown from `/api/admin/companies`).

#### [NEW] [edit/page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/admin/jobs/[id]/edit/page.tsx)
* Form for Admin to edit a job listing.

#### [MODIFY] [page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/admin/companies/page.tsx)
* Add "Create Company" button linking to `/admin/companies/new`.

#### [MODIFY] [page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/admin/companies/[id]/page.tsx)
* Add "Edit Details" button linking to `/admin/companies/[id]/edit`.

#### [MODIFY] [page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/admin/jobs/page.tsx)
* Add "Create Job" button linking to `/admin/jobs/new`.

#### [MODIFY] [page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/admin/jobs/[id]/page.tsx)
* Add "Edit Details" button linking to `/admin/jobs/[id]/edit`.

#### [MODIFY] [applied/page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/candidate/applied/page.tsx)
* Display "Notes" column. Add a "View/Edit Notes" action button opening a Dialog to modify specific application notes.

#### [MODIFY] [page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/candidate/page.tsx)
* Fetch upcoming interviews via `/api/interviews/my-interviews` and replace the mock state.

#### [MODIFY] [page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/recruiter/applicants/[id]/page.tsx)
* Render "Schedule Interview" panel. Integrate a dialog requesting title, date/time, link, duration, and notes, calling `POST /api/interviews`.

#### [MODIFY] [jobs/[id]/page.tsx](file:///c:/Users/LENOVO/OneDrive/Desktop/www/Limenzy/dev/Job-application/client/src/app/candidate/jobs/[id]/page.tsx)
* Render ShareThis widget or custom styled share buttons (LinkedIn, Twitter, Copy Link) on the page detail view.

---

## Verification Plan

### Automated Tests
* Run client and server compilation:
  ```bash
  npm run build (in client)
  npm run build (in server)
  ```

### Manual Verification
1. Log in as **Admin**:
   * Navigate to Companies tab. Create a company profile, choosing an owner recruiter user.
   * View details, edit details.
   * Navigate to Jobs tab. Create a job listing, choosing a company.
   * View details, edit details.
2. Log in as **Recruiter**:
   * Open recruiter candidate applicants page, click "Schedule Interview" for an applicant.
   * Fill out the form and submit.
3. Log in as **Candidate**:
   * Verify candidate applied tracking: add notes to an application.
   * Check candidate home dashboard to see the real upcoming interview panel.
   * View a job and verify social share buttons work.
