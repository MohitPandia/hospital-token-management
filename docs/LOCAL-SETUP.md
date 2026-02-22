# Guide: Run the project locally

## Prerequisites

- **Node.js** 20.19+ or 22+ or 24+ (see `package.json` engines)
- **Yarn** (or `corepack enable` then use yarn)
- **Docker** and **Docker Compose** (for Postgres)

---

## Quick start (first time)

Run these in order from the project root:

```bash
# 1. Install dependencies
yarn install --ignore-engines

# 2. Create .env from example (DB creds + NextAuth)
cp .env.example .env

# 3. Edit .env: set NEXTAUTH_SECRET to a long random string (32+ chars).
#    DB_* can stay as-is for Docker (postgres/postgres, hospital_tokens).

# 4. Start Postgres
docker compose up -d

# 5. Wait a few seconds, then create the database schema
yarn db:setup

# 6. Start the app
yarn dev
```

Open **http://localhost:3000**. Use **Login** → **Register hospital**, then add doctors and tokens.

---

## Environment variables

Use a **`.env`** file in the project root (or `.env.local`; both are loaded).

**Option A – DB credentials (recommended)**  
No need to hardcode the full URL. Set these; the app builds the connection URL in code:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=hospital_tokens
```

**Option B – Single URL**  
You can instead set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospital_tokens
```

**Required for login:**

```env
NEXTAUTH_SECRET=your-long-random-string-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
```

The setup script (`yarn db:setup`) and the Next.js app load **`.env`** and **`.env.local`** (`.env.local` overrides).

---

## One-command setup

After you have dependencies installed and a `.env` (or `.env.local`) with DB and NextAuth vars:

```bash
yarn setup:local
```

This will:

1. Start Postgres (`docker compose up -d`)
2. Create `.env.local` from `.env.example` **only if** `.env.local` does not exist
3. Wait for Postgres
4. Run `yarn db:setup`
5. Start the dev server (`yarn dev`)

If you already use **`.env`**, you don’t need `.env.local`; the script and app read `.env` as well.

---

## Start fresh (reset DB and run again)

To wipe the database and start clean:

```bash
cd /Users/mohit/Documents/hospital-management

# Remove containers and DB volume
docker compose down -v

# Optional: clear Next.js cache
rm -rf .next

# Start Postgres again
docker compose up -d

# Wait a few seconds, then recreate schema
sleep 5
yarn db:setup

# Start the app
yarn dev
```

**Full reset (including node_modules):**

```bash
docker compose down -v
rm -rf .next node_modules
yarn install --ignore-engines
docker compose up -d
sleep 5
yarn db:setup
yarn dev
```

---

## Docker details

- **Image:** Postgres 16 (latest)
- **Port:** 5432
- **Database:** `hospital_tokens`
- **User / Password:** `postgres` / `postgres` (set in `docker-compose.yml`)

Check that the container is running:

```bash
docker compose ps
```

---

## Useful commands

| Command | Description |
|--------|-------------|
| `docker compose up -d` | Start Postgres in background |
| `docker compose down` | Stop containers (data volume kept) |
| `docker compose down -v` | Stop containers and **delete** DB volume |
| `yarn db:setup` | Create/update DB tables (loads `.env` / `.env.local`) |
| `yarn dev` | Start Next.js dev server |
| `yarn build` | Production build |
| `yarn start` | Run production server |

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| **“Set DATABASE_URL or … DB_* in .env or .env.local”** | Create a `.env` (or `.env.local`) with either `DATABASE_URL` or all of `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`. Copy from `.env.example` if needed. |
| **“Connection refused” to localhost:5432** | Run `docker compose up -d` and wait a few seconds for Postgres to start. |
| **“Password authentication failed for user postgres”** | If you previously had a different user (e.g. `hospital`), either use that user’s password or run `docker compose down -v` then `docker compose up -d` and `yarn db:setup` for a fresh DB with `postgres`/`postgres`. |
| **Schema already exists** | Safe. `yarn db:setup` uses `CREATE TABLE IF NOT EXISTS`. |
| **Port 3000 in use** | Stop the other process or use the port Next.js suggests (e.g. 3001). |
