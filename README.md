# EstateAI Admin

The administration dashboard for EstateAI. A standalone Next.js app (its own
deploy, its own domain) that talks to the same API as the public site, through
the admin-only `/api/admin/*` and `/api/blog-admin/*` routes.

## What it does

| Page | What you can do |
| --- | --- |
| **Overview** | Platform health at a glance for the last 7 / 30 / 90 days: users, live listings, paid subscribers, revenue, views, contact clicks, sign-up / listing / view / revenue charts, most-viewed listings, top cities, and a "needs attention" panel (failed or pending payments, suspended accounts, removed listings). |
| **Users** | Search and filter every account (role, plan, email status, identity status, suspended). Open one to see their listings, payments and engagement; **verify** an agent's identity (this is what gives their listings the public "Verified Listing" badge) or **suspend / reactivate** the account. |
| **Listings** | Search and filter every listing with its views and owner. **Remove** a misleading or fraudulent listing (hidden from the public; the agent keeps the record but can't restore it) or **restore** it. |
| **Payments** | Every subscription checkout with status, plan, amount and customer, plus totals collected / pending / failed. Read-only. |
| **Blog** | Write, edit, publish and delete articles for the public blog. |
| **Activity log** | A permanent record of every admin action: who, what, to what, when, and why. |

Suspending an account signs the user out immediately (their token stops
working) and hides their listings and agent profile from the public site.
Nothing is ever deleted by suspending, removing or verifying.

## Running it

```bash
cd admin
npm install
cp .env.example .env.local   # then edit
npm run dev                   # http://localhost:3001
```

Environment variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | The API base URL, e.g. `http://localhost:4000/api` or `https://…railway.app/api`. |
| `NEXT_PUBLIC_SITE_URL` | The public site's URL, used for the "View" links on the Listings page. |

## Creating the first admin

There is deliberately no sign-up for admins. Register a normal account on the
public site, then from `api/`:

```bash
npm run promote:admin -- --email=you@example.com
```

Sign in at the admin app with that account. (Existing sessions pick up the new
role on the next login.)

## Deploying

1. Deploy this folder as its own project (e.g. Vercel, root directory `admin`)
   on its own domain such as `admin.estateai.com.ng`.
2. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` on that project.
3. On the **API** service (Railway), set `ADMIN_ORIGIN` to the admin app's
   exact origin (e.g. `https://admin.estateai.com.ng`) so CORS allows it. It
   accepts a comma-separated list. `WEB_ORIGIN` stays as the public site.

The app sends `noindex` so search engines never list it. Access is enforced by
the API — every `/api/admin` route requires an admin account — not just by the
login screen.
