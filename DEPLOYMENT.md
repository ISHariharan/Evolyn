# Deploying Evolyn (free)

```
Browser ──> Vercel (React build)
              │  /evolyn/api/*  is forwarded (rewrite in vercel.json)
              ▼
            Render: Evolyn-API (Helidon, Docker)
              │  every call carries the X-Internal-Key header
              ▼
            Render: Evolyn-Data-Service (Spring Boot, Docker)
              │
              ▼
            Neon: PostgreSQL
```

| Piece | Host | Free plan notes |
|---|---|---|
| Frontend | Vercel (Hobby) | Static files, always on |
| Evolyn-API | Render web service | Sleeps after 15 min idle; ~1 min to wake |
| Evolyn-Data-Service | Render web service | Same |
| PostgreSQL | Neon (Free) | 1 GB, never expires |

The first request after a quiet spell wakes both Render services one after the other,
so it can take 1–2 minutes. Everything is fast after that.

Deploy in this order: **database → Data Service → API → frontend.** Each step needs a
value from the one before it.

Pick the same region everywhere (e.g. **Singapore**): every request hops between the
services, so keeping them close together keeps it fast.

---

## 0. Before you start

- Push all three repos to GitHub (`main`). Render and Vercel deploy from GitHub.
- Make a shared secret for the two backends and keep it somewhere safe:

  ```bash
  openssl rand -hex 32
  ```

  This is `INTERNAL_API_KEY`. The Data Service rejects any request without it, so
  only your API can read the data.

## 1. Database: Neon

1. Sign up at neon.com and create a project called `evolyn` (region: Singapore).
2. Open **Connect**. Neon shows a connection string like:

   ```
   postgresql://evolyn_owner:AbC123@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/evolyn?sslmode=require
   ```

3. Split it into the three values the Data Service needs:

   | Variable | Value from the example |
   |---|---|
   | `DB_URL` | `jdbc:postgresql://ep-cool-name-123456.ap-southeast-1.aws.neon.tech/evolyn?sslmode=require` |
   | `DB_USERNAME` | `evolyn_owner` |
   | `DB_PASSWORD` | `AbC123` |

   Note `DB_URL` starts with `jdbc:postgresql://` and has **no** user and password in it.

You don't create tables: the Data Service creates them on its first start
(`spring.jpa.hibernate.ddl-auto=update`). The hosted database starts empty; your local
data stays on your laptop.

## 2. Data Service: Render

1. Sign up at render.com with GitHub.
2. **New → Web Service**, choose the `Evolyn-Data-Service` repo.
3. Settings:
   - **Name**: `evolyn-data-service`
   - **Language**: Docker (Render finds the `Dockerfile`)
   - **Branch**: `main`
   - **Region**: Singapore
   - **Instance type**: **Free** (check this before creating)
   - **Health Check Path** (under Advanced): `/health`
4. **Environment variables**:

   | Key | Value |
   |---|---|
   | `DB_URL` | from step 1 |
   | `DB_USERNAME` | from step 1 |
   | `DB_PASSWORD` | from step 1 |
   | `INTERNAL_API_KEY` | from step 0 |
   | `SHOW_SQL` | `false` |

5. **Create Web Service**. The first build takes a few minutes. Wait for
   `Started EvolynDataServiceApplication` in the logs.
6. Note its URL, e.g. `https://evolyn-data-service.onrender.com`, and check:
   - `https://…/health` → `{"status":"UP"}`
   - `https://…/evolyn/api/internal/accounts?userId=00000000-0000-0000-0000-000000000000`
     → `{"message":"Unauthorized"}`. That's correct: the key is doing its job.

## 3. API: Render

1. **New → Web Service**, choose the `Evolyn-api` repo.
2. Settings: **Name** `evolyn-api`, Docker, branch `main`, Singapore, **Free**,
   **Health Check Path** `/health`.
3. **Environment variables**:

   | Key | Value |
   |---|---|
   | `DATA_SERVICE_URL` | the Data Service URL from step 2 (no trailing `/`) |
   | `INTERNAL_API_KEY` | **the same** value as the Data Service |

4. Create it, wait for `Server started` in the logs, and note its URL,
   e.g. `https://evolyn-api.onrender.com`. Check `https://…/health` returns `UP`.

You don't set `PORT` anywhere: Render sets it and both apps read it.

## 4. Frontend: Vercel

1. Make sure `vercel.json` points at **your** API's URL, copied from the top of its
   Render page (currently `https://evolyn-api-urbz.onrender.com`):

   ```json
   "destination": "https://YOUR-API.onrender.com/evolyn/api/:path*"
   ```

   **Never guess this URL.** Render names are global, so when a name is taken Render
   adds a suffix (`evolyn-api-urbz`). The plain `evolyn-api.onrender.com` belongs to
   someone else's app, and pointing the rewrite there sends your users' logins to a
   stranger's server. Check it's yours: `https://YOUR-API.onrender.com/health` must
   return `{"status":"UP","checks":[]}`.

   Commit and push.
2. Sign up at vercel.com with GitHub → **Add New → Project** → import `Evolyn`.
3. Vercel reads `vercel.json` (build command, output folder, rewrites) and
   `package.json` (`"engines": { "node": "22.x" }`). Keep the defaults and **Deploy**.
4. Open your `*.vercel.app` URL, sign up (it's a new, empty database) and try it.

Why the rewrite: the browser calls `/evolyn/api/...` on the Vercel site, and Vercel
forwards it to Render. The browser only ever talks to one site, so there's no CORS
setup, and the frontend code is identical locally (where `"proxy"` in package.json does
the same job) and in production.

## After it's live

- **Deploys are automatic**: pushing to `main` in a repo rebuilds that service.
  Push when a feature is done rather than after every small change: Render's free
  plan has a monthly build-minutes allowance and Java builds take a few minutes each.
- **Logs**: each Render service has a Logs tab; Vercel has one per deployment.
- **Changing a secret**: update it in Render's Environment tab; Render restarts the
  service. `INTERNAL_API_KEY` must always match on both services.

## Shipping a change that touches all three services

Some changes (like editable categories) change what the services send each other.
Deploy them **in order**, waiting for each to be live before the next:

1. **Back up the database first.** In Neon, open **Branches → Create branch** from
   `main` (e.g. `backup-2026-11-14`). It's an instant copy you can restore from.
2. **Data Service.** Push its repo and wait until the Render logs show `Started …`.
   Database changes (new tables/columns and one-time migrations) run on this start.
   Check the log for lines like `Category migration: linked N transaction(s)`.
3. **API.** Push and wait for `Server started`.
4. **Frontend.** Push; Vercel deploys it.

In between steps the live app may briefly fail on the parts that changed (e.g. adding a
transaction). That's expected and stops once all three are deployed.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| First page load takes 1–2 minutes | Services were asleep. Normal on the free plan. |
| Everything fails with `Unauthorized` | `INTERNAL_API_KEY` differs between the two services |
| API returns 502 "Data service is unavailable" | Data Service is down or `DATA_SERVICE_URL` is wrong |
| Data Service won't start, logs mention the database | Check `DB_URL` starts with `jdbc:postgresql://` and ends with `?sslmode=require` |
| Page loads but every API call returns HTML | The rewrite in `vercel.json` points at the wrong API URL |
| API calls return 404 `Route not found` (not an Evolyn message) | The rewrite points at **someone else's** Render app: use the exact URL from your API's Render page |
| Refreshing a page like `/expenses` gives 404 | The second rewrite (`/(.*)` → `/index.html`) is missing |
| Render build fails partway | Open the build log; a failing `mvn package` there fails the same way locally |

## Running locally (unchanged)

Nothing above changes local development. With no environment variables set, every
setting falls back to the local value (`localhost:5432` database, ports 3001/3002) and
the internal-key check is skipped, with a warning printed at start-up.
