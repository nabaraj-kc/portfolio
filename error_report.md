# GitHub Actions Workflow Failure Analysis & Error Report

**Project:** Portfolio & Autonomous AI Content Engine (`nabaraj-kc/portfolio`)  
**Workflow File:** `.github/workflows/ai-cron.yml`  
**Endpoint Target:** `/api/admin/autonomous`  
**Date of Report:** August 10, 2026  

---

## Executive Summary

The daily GitHub Actions workflow (`ai-cron.yml`), which triggers the Portfolio Autonomous AI Content Engine at 00:15 UTC (5:45 AM NPT), has encountered multiple failure vectors:

1. **Run #1 (August 8, 2026):** Failed with `exit code 3` (`URL malformed`).
2. **Run #2 (August 9, 2026):** Failed with `exit code 1` (`HTTP status 401 Unauthorized`).
3. **Run Verification Test (August 10, 2026):** Direct request to `https://www.nabarajkc.com.np/api/admin/autonomous` failed with `HTTP 524` (`Cloudflare Timeout Occurred`).

These issues stem from missing GitHub Repository Secrets, domain 308 redirect header stripping, and synchronous execution of a multi-minute LLM pipeline behind Cloudflare's 100-second proxy gateway timeout.

---

## Detailed Incident & Error Breakdown

### Incident 1: Run #1 (August 8, 2026)
* **Commit:** `fbcc6ff`
* **Trigger:** Daily Cron (`15 0 * * *`)
* **Error Message:** `Process completed with exit code 3`
* **Log Output:** `curl: (3) URL malformed. The syntax was not correct.`

#### Root Cause Analysis
In `fbcc6ff`, the workflow step executed:
```bash
API_URL="${{ secrets.PRODUCTION_URL }}/api/admin/autonomous"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$API_URL" ...)
```
Because the `PRODUCTION_URL` secret was missing/unset in GitHub Repository Secrets, `${{ secrets.PRODUCTION_URL }}` expanded to an empty string. The resulting URL passed to `curl` was `/api/admin/autonomous` (a relative path missing a scheme like `https://`). `curl` failed immediately with exit code 3.

---

### Incident 2: Run #2 (August 9, 2026)
* **Commit:** `699e562`
* **Trigger:** Daily Cron (`15 0 * * *`)
* **Error Message:** `Process completed with exit code 1`
* **Log Output / Annotation:** `::error::AI Content Engine failed with HTTP status 401`

#### Root Cause Analysis
To address the empty URL issue from Run #1, commit `699e562` added fallback values:
```bash
BASE_URL="${RAW_PRODUCTION_URL:-https://nabarajkc.com.np}"
BASE_URL="${BASE_URL%/}"
SECRET="${RAW_CRON_SECRET:-nkc-cron-secret-2026}"
API_URL="${BASE_URL}/api/admin/autonomous"
```

However, two critical issues caused this run to fail with a `401 Unauthorized`:

1. **Domain 308 Redirect & Authorization Header Stripping (Primary Root Cause):**
   - The fallback URL set in the script is `https://nabarajkc.com.np`.
   - Production hosting (Cloudflare/Vercel) enforces canonical host redirects, issuing a `308 Permanent Redirect` from `https://nabarajkc.com.np/api/admin/autonomous` to `https://www.nabarajkc.com.np/api/admin/autonomous` (note the `www`).
   - When `curl -sSL` follows cross-host redirects (`nabarajkc.com.np` $\rightarrow$ `www.nabarajkc.com.np`), standard `curl` **strips sensitive HTTP headers like `Authorization: Bearer ...` by security design** unless `--location-trusted` is explicitly passed.
   - Consequently, the request forwarded to `https://www.nabarajkc.com.np/api/admin/autonomous` arrived with **no Authorization header**.
   - `src/proxy.ts` (Next.js middleware/proxy) intercepted the request, checked for authorization, found none, and responded with `401 Unauthorized` (`{"error":"Unauthorized access"}`).

2. **Missing GitHub Repository Secrets:**
   - Neither `PRODUCTION_URL` nor `CRON_SECRET` has been configured under **GitHub Repository Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions**.
   - Therefore, the workflow continues to rely on fallback defaults (`https://nabarajkc.com.np` and fallback token).

---

### Incident 3: Cloudflare Gateway Timeout (HTTP 524)
* **Target:** `https://www.nabarajkc.com.np/api/admin/autonomous`
* **Error Code:** `HTTP 524` (`A Timeout Occurred`)

#### Root Cause Analysis
- Cloudflare proxies all traffic to `nabarajkc.com.np` with an unmodifiable gateway timeout of **100 seconds**.
- In `src/app/api/admin/autonomous/route.ts`, the route synchronously performs:
  - RAG discovery & deep research queries
  - Multi-agent outline, writer, and editor LLM prompt cycles
  - Image generation & uploading to Firebase Storage
  - Database insertions & a 3-attempt verification loop with built-in sleep delays
  - Email dispatch via Nodemailer
- The entire process can take upwards of 2 to 9 minutes to complete.
- Because the route blocks synchronously until execution finishes, Cloudflare terminates the HTTP connection at 100 seconds with `HTTP 524`, causing `curl` in GitHub Actions to fail even when authenticated!

---

## Technical Verification & Findings

Command execution test results:

```bash
# Test 1: Apex domain redirect check
curl.exe -i -sSL -X GET "https://nabarajkc.com.np/api/admin/autonomous" -H "Authorization: Bearer nkc-cron-secret-2026"
# Result: 308 Permanent Redirect -> 401 Unauthorized (Header stripped)

# Test 2: Direct www canonical endpoint check
curl.exe -i -sSL -X GET "https://www.nabarajkc.com.np/api/admin/autonomous" -H "Authorization: Bearer nkc-cron-secret-2026"
# Result: HTTP 524 (Cloudflare proxy timeout after 100s)
```

---

## Summary of Errors & Status

| Failure # | Error Code | Root Cause | Fix Required |
| :--- | :--- | :--- | :--- |
| **Run #1** | `Exit Code 3` | Unset `PRODUCTION_URL` secret caused relative URL (`/api/admin/autonomous`) | Add robust fallback URL in `ai-cron.yml` |
| **Run #2** | `HTTP 401` | Apex domain 308 redirect caused `curl` to strip `Authorization` header | Use canonical `www` URL & add `--location-trusted` flag |
| **Run #3** | `HTTP 524` | Route execution (>100s) exceeds Cloudflare proxy timeout | Non-blocking background worker pattern (`waitUntil` / immediate response) in `route.ts` |

---

## Next Steps

We will update the implementation plan (`implementation_plan.md`) to fix both the workflow script and the route execution model to prevent Cloudflare 524 timeouts.
