audit-all-tools.mjs — full tools audit

Requirements:
  - Node 20+
  - Backend running on port 4000 (for API checks)
  - Frontend running on port 3000 (optional, for page checks)
  - Python workers running for worker-backed tools (optional; warns if down)

Run from repo root:

  node scripts/audit-all-tools.mjs

With custom URLs:

  API_URL=http://localhost:4000/api/v1 FRONTEND_URL=http://localhost:3000 node scripts/audit-all-tools.mjs

Skip live checks (static only):

  CHECK_API=false CHECK_FRONTEND=false node scripts/audit-all-tools.mjs

From Backend folder:

  pnpm run audit:tools

From Frontend folder:

  pnpm run audit:tools

AI code generator diagnose (OpenAI / worker 8107):

  Services\ai-assistant\diagnose.bat

  node scripts/test-ai-assistant.mjs
