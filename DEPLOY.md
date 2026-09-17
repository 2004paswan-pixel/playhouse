# Deploying Unions'Q to Vercel — a very basic guide

This app runs right away with sample data, so you can deploy and share a working link
today, then connect real login/booking later.

## 1. Put the code on GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `unions-q`). Keep it empty — no README, no .gitignore.
2. On your computer, inside the `unions-q` folder, run:
   ```
   git remote add origin https://github.com/YOUR-USERNAME/unions-q.git
   git add -A
   git commit -m "Initial Unions'Q build"
   git branch -M main
   git push -u origin main
   ```

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in (use "Continue with GitHub" — it's the easiest).
2. Click **Add New… → Project**.
3. Pick the `unions-q` repository from the list and click **Import**.
4. Leave all the build settings as-is (Vercel auto-detects Next.js).
5. Click **Deploy**. Wait about a minute.

That's it — Vercel gives you a live link like `https://unions-q.vercel.app`.
It works immediately with the built-in sample slots and bookings, no extra setup needed.

## 3. Share the link

Copy the link Vercel shows you after deploy (also visible any time on your Vercel
project dashboard) and send it to anyone — it's public by default, no login required
for them to view it.

## 4. (Optional, later) Connect real login and a real database

Right now the app uses sample data so it works instantly. To make logins and bookings
real:

1. Create a free project at [supabase.com](https://supabase.com).
2. In your Supabase project, go to **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql` from this repo, and run it.
3. In Supabase, go to **Project Settings → API** and copy the **Project URL** and
   **anon public key**.
4. In Vercel, go to your project → **Settings → Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon public key
5. Go to **Deployments**, click the ⋯ menu on the latest deployment, and choose
   **Redeploy** so the new variables take effect.

## 5. Swapping in your real logo

Replace `public/logo.svg` with your actual logo file (keep the filename `logo.svg`,
or update the two references to it in `src/components/Sidebar.tsx` and
`src/app/login/page.tsx` if you use a different filename/format like `.png`). Commit
and push — Vercel redeploys automatically on every push to `main`.
