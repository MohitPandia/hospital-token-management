# Codebase structure

Modular layout for easier scaling and new features.

## `/src`

### `app/`
- **Page routes**: `page.tsx` files are thin; they compose **components** and **hooks**.
- **Layouts**: `layout.tsx` for shared shell (e.g. dashboard with header).
- **API routes**: Under `app/api/`. Handlers stay thin; auth and validation here, business logic in `lib/` where needed.

### `components/`
- **`ui/`** – Reusable primitives: `Button`, `Card`, `Input`, `BackLink`, `LoadingState`, `PageHeader`. Use these for consistency.
- **`dashboard/`** – Dashboard-specific: `DoctorList`, `AddDoctorForm`, `QueueActions`, `CurrentTokenCard`, `TokenList`, `AddTokenForm`.
- **`patient/`** – Patient flow: `PatientLookupForm`, `PatientResultCard`.

Add new features by adding components in the right group (or a new folder, e.g. `components/reports/`) and importing in pages.

### `hooks/`
- **`useDoctors`** – Fetch and refetch doctors list.
- **`useDoctorQueue`** – Tokens for a doctor, plus `callNext`, `markDone`, `refetch`.
- **`usePatientLookup`** – Patient lookup by code (`result`, `lookup`).

Add new data flows as hooks (e.g. `useHospitalSettings`) and keep pages free of fetch logic.

### `lib/`
- **`api/`** – Client-side API helpers: `doctors`, `tokens`, `patient`. Single place for `fetch` and error handling.
- **`auth.ts`** – User lookup, password verify, hospital registration (used by API and NextAuth).
- **`auth-options.ts`** – NextAuth config (shared by route and `getServerSession`).
- **`db.ts`** – Neon serverless client and schema setup (DATABASE_URL).
- **`date.ts`** – Date helpers (e.g. `todayDateString()`).
- **`estimate.ts`** – Visit time estimation (avg duration, IST formatting).

When adding features, add API functions in `lib/api/`, reuse or extend `lib/` helpers, and keep API route handlers thin.

### `types/`
- **`domain.ts`** – Shared domain and API types: `Doctor`, `Token`, `PatientLookupResult`, `AddTokenResponse`, `TOKEN_STATUS_LABELS`, `getTokenStatusLabel`.
- **`next-auth.d.ts`** – NextAuth session/user extensions.

Define new entities and DTOs in `types/domain.ts` (or a new file like `types/reports.ts`) so components and API stay in sync.

## Adding a new feature

1. **Types** – Add or extend types in `types/`.
2. **API** – Add route under `app/api/` and/or client helpers in `lib/api/`.
3. **Hook** (if data-fetching) – Add hook in `hooks/` that uses `lib/api`.
4. **Components** – Add UI in `components/ui/` (generic) or a feature folder under `components/`.
5. **Page** – Compose components and hooks in a thin `page.tsx`.
