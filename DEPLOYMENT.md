# Legal Bot online services

The public site is hosted by GitHub Pages. The API runs separately on Render,
and Supabase provides user authentication and private data storage.

## 1. Create the Supabase project

1. Create a Supabase project and open its **SQL Editor**.
2. Run the complete SQL migration in
   [`supabase/migrations/20261012000000_online_features.sql`](./supabase/migrations/20261012000000_online_features.sql).
3. In **Authentication → URL Configuration**, set the site URL to
   `https://netishsharma514-code.github.io/Legal-Bot-1/` and add that URL to the
   redirect URL allow-list.
4. Copy the project URL, the publishable/anon key, and the `service_role` key.
   The `service_role` key is a server-only secret; never add it to GitHub Pages,
   frontend environment variables, or committed files.

The migration restricts conversation history to its signed-in owner. Inquiry
and advocate-application tables have row-level security enabled with no public
read/write policies; their inserts go through the rate-limited API using the
server-only service key.

## 2. Deploy the API on Render

1. In Render, create a **Blueprint** from this GitHub repository and use the
   root `render.yaml` configuration.
2. Add these private environment variables to the `legal-bot-api` service:
   - `GEMINI_API_KEY`: the key for the Gemini API used by chat and document review.
   - `SUPABASE_URL`: the Supabase project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: the Supabase `service_role` key.
3. Deploy. The health check is
   `https://<your-render-service>.onrender.com/api/healthz`; it stays not-ready
   until all three server environment variables are set.

The Render free service may sleep when idle, so its first request after a quiet
period can take longer. The API applies per-IP request limits and permits browser
requests only from the configured GitHub Pages origin and localhost.

## 3. Connect the GitHub Pages build

In the GitHub repository, open **Settings → Secrets and variables → Actions →
Variables** and create these repository variables:

| Variable | Value |
| --- | --- |
| `VITE_API_BASE_URL` | The Render service origin, e.g. `https://<your-render-service>.onrender.com` |
| `VITE_SUPABASE_URL` | The Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | The Supabase publishable/anon key |

These `VITE_` values are included in the public browser bundle. Only the
publishable/anon key belongs there, and it is safe only with the migration's
row-level security policies. Never put `GEMINI_API_KEY` or
`SUPABASE_SERVICE_ROLE_KEY` in GitHub Actions variables or the frontend.

After setting the variables, run **Actions → Deploy Legal Bot to GitHub Pages →
Run workflow**, or push a commit to `main`. Confirm both Render's health check
and the Pages deployment succeed.

## 4. Verify the live features

- Register an account, confirm the email, sign in, and verify that its
  consultation history is available after reloading.
- Ask a question and confirm the response reports Gemini as its source when
  the API key is active; a statutory fallback is labelled separately.
- Upload a searchable PDF/DOCX or paste text, consent to processing, and check
  that extraction/review completes. Scanned-image PDFs still require OCR and
  are not supported by the current extractor.
- Submit a consultation or advocate application and confirm it appears in the
  corresponding Supabase table. The site stores these submissions but does not
  send an email or notify an advocate.

The advocate directory is intentionally empty until profile identities and
contact details can be independently verified. Add only verified profiles
before representing anyone as available or relying on the listings for legal
services.
