# Hospital Token Management System — Design Document

## 1. Overview

A **hospital token management** system where:
- **Hospitals** register on the portal and add **doctors**.
- **Patients** get a **unique code** when they book a token.
- The system estimates **actual visit time (IST)** and **waiting position** by learning from how long each consultation takes, so patients know **when to come** instead of fixed slot times that slip.

**Core problem solved:** Patients are told “come at 2 PM” but get called at 4 PM, or come early and wait too long. We show **live estimated time** and **token position** so they can plan when to actually visit.

---

## 2. User Roles & Interfaces

| Role | Who | What they do |
|------|-----|----------------|
| **Hospital** | Hospital admin | Register hospital, add/edit doctors, (later) see queues and stats |
| **Doctor** | Doctor at a hospital | Manage today’s token queue: call next, mark done, (optional) set avg consultation time |
| **Patient** | Person with a token | Use **unique code** only → search hospital → select doctor → see **token number**, **position in queue**, **estimated IST time** to visit |

There is **one frontend** (single Next.js app) with different entry points:
- **Hospital/Doctor:** Login → hospital dashboard → doctor list → doctor’s token queue.
- **Patient:** No login. One page: enter **unique code** (or search hospital + doctor and then identify by code/name) → see **when to visit** and **current position**.

---

## 3. Main Flows

### 3.1 Hospital & doctor (admin side) — minimal auth

1. **Landing** → single **“Login”** button (no separate “Register” on landing to keep it minimal).
2. **Click Login** → one **auth page** where:
   - Existing hospital: **Email + Password** → Login → Dashboard.
   - New hospital: link/button **“Register hospital”** on the same page → simple form (hospital name, admin email, password) → after register, auto-login → Dashboard.
3. **Dashboard** → list of doctors, add doctor, open doctor’s queue.
4. **Doctor queue** → tokens for today, “Call next”, “Mark done”, “Add token” (creates unique code to give to patient).

So: **no dedicated login page** — one “Login” button that leads to a single auth screen (login form + option to register). Very minimal.

---

### 3.2 How the patient accesses the system (no login)

**Where does the patient get the code?**  
When a token is created for them (by hospital staff at reception or on the doctor’s queue screen), the **system generates a unique code**. The staff **gives this code to the patient** (e.g. written on a slip, or read out: “Your code is PH-2202-A7X9”).

**How does the patient use our system?**  
1. Patient opens the **same website** (e.g. `hospital-tokens.vercel.app`).  
2. On the **landing page** they see something like **“Check my token”** (or “Patient” / “When should I visit?”). They click it — **no login**.  
3. They are on the **patient page**. They **enter only their unique code** (e.g. `PH-2202-A7X9`) and submit.  
4. System finds that token → shows: **Token number**, **position in queue**, **estimated IST time to visit** (and optionally hospital/doctor name).  
5. Patient can refresh the page and enter the code again anytime to see updated time.

**Summary:** Patient does **not** create an account or log in. **Access = unique code** they received when the token was issued. One page, one input (code), one result (when to visit).

**What the patient sees after entering the code:**  
- Your token number (e.g. #5)  
- Current position in queue (e.g. 3rd)  
- Estimated time to visit in IST (e.g. 3:45 PM) or "in ~45 minutes"  
- Optional: hospital and doctor name.

---

## 4. Data Model (Prototype)

### 4.1 Entities

- **Hospital**  
  - id, name, contact (email/phone), address (optional), createdAt.

- **User (Hospital admin)**  
  - id, email, password (hashed), hospitalId, role = `hospital`.

- **Doctor**  
  - id, hospitalId, name, contact (optional), createdAt.

- **Token / Appointment (per doctor per day)**  
  - id, doctorId, date (e.g. 2025-02-22), **patientUniqueCode** (unique), patientName (optional), tokenNumber (1, 2, 3…), status: `waiting` | `current` | `done` | `cancelled`, createdAt.  
  - Optional for estimates: **startedAt**, **endedAt** (so we can compute consultation duration).

- **Session / Queue (optional but useful)**  
  - One “session” per doctor per day: start time, end time (optional). Tokens belong to that session. Prototype can treat “today’s tokens” as one queue.

### 4.2 Unique code

- **patientUniqueCode:** Given when token is issued (e.g. `PH-SP-2202-005` or a short random code).  
- **Must be unique** across the system so that when a patient enters it, we can resolve to exactly one token (and hence hospital + doctor + queue position and estimated time).

---

## 5. Estimated Visit Time (IST) — How It Works

- **Inputs:**  
  - Current queue: tokens in order (e.g. 1–10).  
  - For each **completed** token: `startedAt`, `endedAt` → duration.  
  - For **current** token: `startedAt` → so far elapsed.

- **Logic (prototype):**  
  - Average consultation duration (e.g. from last N completed tokens, or a doctor default like 10 min).  
  - For each **waiting** token:  
    - Position in queue (e.g. 3rd) × average duration ≈ minutes from now.  
    - **Estimated IST time** = now + (position × avg duration).  
  - Show patient: “Estimated time: 3:45 PM IST” and “Approx. 45 minutes from now.”

- **Refinements (later):** Use median instead of mean, or per-doctor default set by hospital; “current” patient’s elapsed time to improve estimate for next.

---

## 6. Tech Stack & Deployment

- **Framework:** Next.js (App Router recommended).  
- **Hosting:** Vercel.  
- **Database:** **Neon** (Postgres via `@neondatabase/serverless`). Use `DATABASE_URL` (or `POSTGRES_URL`) for local dev and production. Works on Vercel with Neon integration.  
- **Auth (prototype):**  
  - Hospital login: simple **email + password** (NextAuth.js or similar).  
  - No patient login; access by **unique code** only.  
- **UI:** React, Tailwind CSS; responsive so patients can check on phone.

---

## 7. Screens (Prototype)

### 7.1 Public

| Screen | Route (example) | Description |
|--------|------------------|-------------|
| Landing | `/` | Logo, “Login” (hospital), “Check my token” / “Patient” link. |
| Patient – Check token | `/patient` or `/visit` | Input: unique code (and optionally hospital + doctor). Output: token #, position, estimated IST time, doctor name. |

### 7.2 Hospital (after login)

| Screen | Route (example) | Description |
|--------|------------------|-------------|
| Dashboard | `/dashboard` | List of doctors; “Add doctor”. |
| Doctor queue | `/dashboard/doctor/[id]` or `?date=...` | List of tokens for that doctor (today); “Call next”, “Mark done”; optional: add token (patient name + generated unique code). |

### 7.3 Auth

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/login` | Email + password → hospital dashboard. |
| Register hospital | `/register` | Hospital name + admin email + password → create hospital + first user. |

---

## 8. Two “Frontiers” (Clarification)

You mentioned “two frontiers” — interpreted as:

1. **Hospital/Doctor frontier:** Login → manage hospital, doctors, and token queue (who’s next, mark done, see list).  
2. **Patient frontier:** No login; single page where patient uses **unique code** (and optionally hospital + doctor) to see **when to visit (IST)** and **position**.

Single codebase, single frontend; different entry points and permissions.

---

## 9. Security & Privacy (Prototype)

- **Hospital routes:** Protected by session; only logged-in hospital can see its doctors and queues.  
- **Patient data:** Access only by **unique code**. No listing of all patients; patient sees only their own token info.  
- **Codes:** Long enough and random to be unguessable (e.g. 8–10 alphanumeric).

---

## 10. Phase 1 (Prototype) — Checklist

- [ ] Next.js app (App Router), Tailwind, ESLint.  
- [ ] DB: Neon (DATABASE_URL); tables: Hospital, User, Doctor, Token.  
- [ ] Auth: Register hospital, Login (email + password).  
- [ ] Dashboard: List doctors, Add doctor.  
- [ ] Doctor queue: List tokens for today, “Call next”, “Mark current as done”; optional: “Add token” (generates unique code, patient name).  
- [ ] Patient page: Enter unique code → show token #, position, **estimated IST time** (using simple average duration).  
- [ ] Basic “estimated time” logic: average of completed consultations; show IST and “in X minutes”.  
- [ ] Deploy on Vercel, connect DB.

---

## 11. Later Phases (Out of scope for prototype)

- Patient self-booking (request token → hospital approves → code generated).  
- SMS/WhatsApp notification with link + code.  
- Per-doctor default consultation duration.  
- History and analytics for hospital.  
- Multi-branch hospitals, slots per session.

---

## 12. Summary

| Item | Choice |
|------|--------|
| Frontend | Single Next.js app; two entry flows (hospital vs patient). |
| Patient access | By **unique code** only (no login). |
| Patient flow | Search hospital → doctor → enter code (or direct code entry) → see token #, position, **estimated IST visit time**. |
| Hospital flow | Register → Login → Doctors → Per-doctor token queue (call next, mark done). |
| Estimate | Based on completed consultation durations; show IST and minutes from now. |
| Deploy | Vercel; DB Neon (DATABASE_URL). |

If this matches your intent, next step is **development**: scaffold Next.js, DB schema, auth, dashboard, queue actions, patient page, and estimation logic. We can then add Vercel deployment steps when you’re ready.
