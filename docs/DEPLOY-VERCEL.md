# Deploy on Vercel

This guide gets the Hospital Token Management app running on Vercel with a Neon Postgres database.

## Prerequisites

- A [Vercel](https://vercel.com) account (GitHub login is easiest)
- A [Neon](https://neon.tech) account (free tier is enough)
- Code pushed to a Git repo (GitHub, GitLab, or Bitbucket)

---

## 1. Create the database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign in.
2. Create a new project (e.g. **hospital-tokens**), pick a region close to your users.
3. After the project is created, open the **Connection details** or **Dashboard** and copy the **connection string**. It looks like:
   ```text
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. (Optional) Rename it to **DATABASE_URL** in Neon’s “Connection string” copy option if they offer it; otherwise you’ll use it as-is in Vercel.

Neon’s serverless driver is already used by the app when the connection string is not `localhost` / `127.0.0.1`.

---

## 2. Push your code to Git

If you haven’t already:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Use your actual repo URL and branch name (`main` or `master`).

---

## 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New…** → **Project**.
3. Import your Git repository (e.g. GitHub). Authorize Vercel if asked.
4. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** leave blank (or set if the app is in a subfolder)
   - **Build Command:** `next build` (default)
   - **Output Directory:** default
   - **Install Command:** `yarn install` or `npm install` depending on your lockfile
5. Before deploying, add **Environment Variables** (see below). You can add them in this screen or later in **Project → Settings → Environment Variables**.

---

## 4. Environment variables (required)

In the Vercel project, go to **Settings → Environment Variables** and add:

| Variable             | Description |
|----------------------|-------------|
| `DATABASE_URL`       | Full Neon connection string (from step 1). Example: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET`     | A long random string (32+ characters). Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL`       | Your app’s public URL. For Vercel: `https://your-project.vercel.app` (replace with your real URL). Add the same variable for Preview if you use branch deploys. |

- Apply to **Production** (and **Preview** if you want auth on preview URLs).
- Redeploy after adding or changing variables (Deployments → … → Redeploy).

---

## 5. Deploy and create schema

1. Click **Deploy** (or push a new commit after the project is connected).
2. Wait for the build to finish.
3. Open your app URL (e.g. `https://your-project.vercel.app`).
4. Use **Login** → **Register hospital** and complete registration. The first successful request that hits the DB will run `ensureSchema()` and create the tables (no manual DB setup needed).

If you see DB errors, double-check `DATABASE_URL` and that the Neon project is not paused (free tier can pause after inactivity).

---

## 6. Optional: custom domain

In Vercel: **Project → Settings → Domains** → add your domain and follow the DNS instructions.

After adding a domain, set **NEXTAUTH_URL** to that domain (e.g. `https://tokens.yourhospital.com`) and redeploy.

---

## Summary checklist

- [ ] Neon project created; connection string copied
- [ ] Repo pushed to GitHub/GitLab/Bitbucket
- [ ] Vercel project created and repo connected
- [ ] `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` set in Vercel
- [ ] Deploy triggered and build succeeded
- [ ] Opened app URL and registered a hospital (tables created on first use)
