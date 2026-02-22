#!/usr/bin/env node
/**
 * One-command local setup: start Docker DB, copy .env if needed, run schema, start dev server.
 * Run: yarn setup:local
 */
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function log(msg) {
  console.log("[setup:local]", msg);
}

// 1. Start Docker Postgres
log("Starting Postgres with Docker...");
execSync("docker compose up -d", { cwd: root, stdio: "inherit" });

// 2. Copy .env.example → .env.local if missing
const envLocal = path.join(root, ".env.local");
const envExample = path.join(root, ".env.example");
if (!fs.existsSync(envLocal)) {
  log("Creating .env.local from .env.example");
  fs.copyFileSync(envExample, envLocal);
  log("Edit .env.local if you need to change NEXTAUTH_SECRET.");
} else {
  log(".env.local already exists, skipping copy.");
}

// 3. Wait for Postgres to be ready
log("Waiting for Postgres to be ready...");
const sleep = (ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
};
sleep(4000);

// 4. Run schema setup
log("Creating database schema...");
execSync("node scripts/setup-db.js", { cwd: root, stdio: "inherit" });

// 5. Start dev server
log("Starting dev server (yarn dev)...");
spawn("yarn", ["dev"], { cwd: root, stdio: "inherit", shell: true }).on(
  "exit",
  (code) => process.exit(code ?? 0)
);
