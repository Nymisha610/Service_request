# Free deployment guide

You need **two** things online: the React frontend (static files) and the Python API (a running server).
A static host cannot run FastAPI, so the two parts are deployed separately and connected through URLs.

> **About accuracy.** Free tiers change. Facts below were checked against the providers' public documentation
> on **11 Oct 2026**. Dashboard button names can differ slightly; re-check the provider's current docs and
> pricing page before you start. Nothing here requires a paid plan. If a provider asks for payment details you
> are not comfortable giving, stop and use an alternative (see section 11) or document the blocker.

## Recommended setup

| Part | Host | Why | Free-tier facts to know |
| --- | --- | --- | --- |
| Python API | **Render** (Web Service, Free instance type) | Runs a Python/FastAPI process from a Git repo | 750 free instance hours per workspace per month. Free web services **spin down after 15 minutes without traffic** and take about a minute to wake up. They have an **ephemeral filesystem** (files are lost on restart, redeploy or spin-down) and Render may restart them at any time. |
| Frontend | **Vercel** (Hobby plan) | Detects Vite projects and serves the build over HTTPS | The Hobby plan is for **personal, non-commercial** use. On Hobby you can roll back only to the immediately previous production deployment. |

Alternative for the frontend: a **Render Static Site** (Render documents static sites as free), which keeps
everything in one account. Netlify, Cloudflare Pages and GitHub Pages are also commonly used for static
frontends; confirm their current free-plan terms yourself before relying on them.

## 0. Before you deploy

1. Fix the bugs locally and confirm `npm run build` succeeds.
2. Push the project to a Git repository (GitHub/GitLab). Make sure no secrets or `.env` files are committed.
3. Deploy the **API first**, because the frontend needs its URL.

## 1. Deploy the Python API to Render

1. Create a free Render account and choose **New → Web Service**; connect your repository.
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance type:** Free
3. Environment variables (section 4): add `PYTHON_VERSION` (for example `3.12.3`) and `CORS_ORIGINS`
   (you will set the real value after the frontend exists; use a placeholder for now).
4. Create the service and wait for the first deploy. Open `https://<your-service>.onrender.com/api/health`.
   You should see JSON with `"status": "ok"`. The first request after idle can take about a minute.

## 2. Deploy the React frontend to Vercel

1. Create a free Vercel (Hobby) account and choose **Add New → Project**; import the same repository.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` · **Output Directory:** `dist`
3. Add the environment variable described in section 3, then **Deploy**.
4. Open the `https://<project>.vercel.app` URL.

(Render Static Site equivalent: Root Directory `frontend`, Build Command `npm install && npm run build`,
Publish Directory `dist`.)

## 3. Configure the production API URL

Vite replaces `import.meta.env.VITE_*` values **at build time** and writes them into the JavaScript bundle.
Consequences:

- Only variables whose names start with `VITE_` are exposed to browser code.
- Changing a variable in the hosting dashboard has no effect until you **rebuild/redeploy**.
- Everything in the bundle is public. Never put a secret in a `VITE_` variable.

See `frontend/.env.example`. In the hosting dashboard, set `VITE_API_BASE_URL` to your API's public URL, for
example `https://<your-service>.onrender.com` (no trailing slash), then redeploy.

## 4. Environment variables summary

| Where | Name | Example value |
| --- | --- | --- |
| Render (API) | `PYTHON_VERSION` | `3.12.3` |
| Render (API) | `CORS_ORIGINS` | `https://<project>.vercel.app` |
| Vercel (frontend) | `VITE_API_BASE_URL` | `https://<your-service>.onrender.com` |

## 5. Configure CORS for the deployed frontend

Browsers only let a page call an API on another origin if the API's response says that origin is allowed.
Set `CORS_ORIGINS` on the API to the exact **origin** of your frontend: scheme + host, no path, no trailing
slash (`https://my-app.vercel.app`). Separate several origins with commas. Save the variable and wait for the
API to redeploy/restart.

Remember: every distinct URL is a different origin. Vercel *preview* deployments and a custom domain have
different hostnames from your production URL, so add them if you want those to work too.

## 6. Custom domain (optional)

Only if you **already own** a domain (registering one costs money and is not part of this assignment).

1. Vercel: *Project → Settings → Domains → Add*, then create the DNS records the dashboard shows at your DNS provider.
   (For the API, Render offers a similar *Custom Domains* setting.)
2. Wait for DNS to propagate. The platform then issues a certificate automatically.
3. Add the new frontend origin (`https://app.example.com`) to the API's `CORS_ORIGINS`.
4. If you moved the API to a custom domain, update `VITE_API_BASE_URL` and redeploy the frontend.

## 7. Enable and verify HTTPS

The default `*.vercel.app` and `*.onrender.com` addresses are served over HTTPS. Verify rather than assume:

- The browser shows a padlock, and the address starts with `https://`.
- `curl -I https://<your-service>.onrender.com/api/health` returns `HTTP/2 200`.
- The Console shows no *mixed content* warnings (an HTTPS page must not call `http://` API URLs).

## 8. Test in a fresh browser session

Use a private/incognito window (or another browser or device) so that cached files, cookies and local
storage cannot hide problems. Then:

1. Open the frontend URL. Open DevTools → **Network** and tick *Disable cache*.
2. Reload and confirm that the API requests go to **your deployed API URL** and return 200.
3. Submit a valid request, then an invalid one. Confirm the success and error messages.
4. Check mobile width (DevTools device toolbar, or a real phone).
5. Leave the API idle for 15+ minutes, then reload. Expect a slow first load on a free Render instance and
   decide whether the UI handles the delay acceptably.
6. Record the result in your submission.

## 9. Inspect deployment logs

- **Render:** open the service → **Logs**. Build output shows dependency/build failures; runtime logs show
  `uvicorn` startup and every request line, including validation warnings.
- **Vercel:** open the project → **Deployments** → select a deployment → build logs. Frontend runtime errors
  appear in the *browser* Console, not in Vercel logs.
- Typical failures: wrong Root Directory, wrong start command (the API must bind to `0.0.0.0` and `$PORT`),
  missing `PYTHON_VERSION`, a CORS origin typo, or an environment variable that was changed but not redeployed.

## 10. Roll back a broken deployment

- **Git (works everywhere, always safe):** `git revert <bad-commit>` then push. The hosts redeploy from the
  new commit.
- **Vercel:** *Deployments* tab → the previous production deployment → **Instant Rollback**. On Hobby you can
  roll back to the immediately previous production deployment only. Rollback disables automatic assignment of
  production domains until you promote a deployment again (`vercel promote <deployment>` or the dashboard).
- **Render:** the dashboard lets you redeploy an earlier commit for a service; check the service's **Events /
  Deploys** page for the options available on your plan.
- After any rollback, repeat the fresh-session test in section 8.

## 11. If a free tier is unavailable or blocked

Document the exact blocker (screenshot or message), then provide a written deployment plan, ideally with a
working alternative host for the part that failed. Do not enter payment details just to complete the exercise.
Submitting the blocker plus a clear plan is an acceptable outcome.

## Known limitations of this arrangement

- Cold starts: a sleeping free Render instance needs about a minute to wake.
- Data is not durable on an ephemeral filesystem; the sample data reappears after a restart.
- Free-instance hours are shared across the whole Render workspace.
- Vercel Hobby is for non-commercial use.
