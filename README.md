# Smart Bookmark App

A simple private bookmark manager with **Google OAuth only**, **real-time sync** across tabs, and deployment on **Vercel**.

- **Sign up / Log in**: Google only (no email/password).
- **Bookmarks**: Add (URL + title), list, and delete. Data is private per user (RLS).
- **Real-time**: Open two tabs; add or delete in one tab and the list updates in the other without refresh.
- **Stack**: Next.js (App Router), Supabase (Auth, Database, Realtime), Tailwind CSS.

## Live app

- **Vercel URL**: Set after first deploy (e.g. `https://smart-bookmark-app-xxx.vercel.app`).

## Run locally

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd smart-bookmark-app
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In **SQL Editor**, run the migration: `supabase/migrations/001_bookmarks.sql`.
   - In **Authentication → Providers**, enable **Google** and add your Google OAuth Client ID and Secret (from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)).
   - In **Authentication → URL Configuration**, set **Site URL** to `http://localhost:3000` and add **Redirect URLs**: `http://localhost:3000/auth/callback`.
   - In **Project Settings → API**, copy **Project URL** and **anon public** key.

3. **Environment**
   - Copy `.env.local.example` to `.env.local`.
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4. **Google OAuth (local)**
   - In Google Cloud Console, create OAuth 2.0 credentials (Web application).
   - **Authorized JavaScript origins**: `http://localhost:3000`.
   - **Authorized redirect URIs**: `http://localhost:3000/auth/callback`.

5. **Realtime**
   - In Supabase: **Database → Replication**. Ensure the `bookmarks` table is enabled for Realtime (or that the table is in the `supabase_realtime` publication; the migration does this).

6. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000), sign in with Google, add/delete bookmarks, and test in two tabs.

## Deploy on Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In Supabase **Authentication → URL Configuration**:
   - **Site URL**: your Vercel URL (e.g. `https://your-app.vercel.app`).
   - **Redirect URLs**: `https://your-app.vercel.app/auth/callback` and `https://*.vercel.app/auth/callback` for preview deployments.
4. In Google Cloud Console, add:
   - **Authorized JavaScript origins**: `https://your-app.vercel.app`
   - **Authorized redirect URIs**: `https://your-app.vercel.app/auth/callback`
5. Deploy. After the first deploy, put the live URL in this README under **Live app**.

## Problems and solutions

### 1. Google OAuth redirect / “redirect_uri_mismatch”
- **Problem**: After clicking “Sign in with Google”, redirect failed or showed a mismatch error.
- **Solution**: The redirect URI must match exactly in three places: (1) Supabase **Redirect URLs**, (2) Google Cloud **Authorized redirect URIs**, and (3) the app (we use `origin + '/auth/callback'`). For Vercel previews we added `https://*.vercel.app/auth/callback` in Supabase and use the same pattern in Google if needed.

### 2. Realtime not updating in the second tab
- **Problem**: Adding a bookmark in one tab did not update the list in another tab.
- **Solution**: Ensured the `bookmarks` table is in the `supabase_realtime` publication (migration runs `alter publication supabase_realtime add table public.bookmarks`) and that **Database → Replication** in Supabase has Realtime enabled for this table. The client subscribes with `postgres_changes` on `public.bookmarks` and refetches the list on any change.

### 3. “Row level security” / user seeing another user’s bookmarks
- **Problem**: Need to guarantee User A never sees User B’s bookmarks.
- **Solution**: Enabled RLS on `bookmarks` and added policies so all operations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) use `auth.uid() = user_id`. All queries filter by `user_id` from the authenticated user; RLS is a second layer of protection.

### 4. Cookies / session not persisting (e.g. after OAuth redirect)
- **Problem**: Session lost after redirect from Google back to the app.
- **Solution**: Used `@supabase/ssr` and the recommended Next.js pattern: server client in `createClient()` (server), browser client in `createClient()` (client), and middleware that calls `getUser()` and correctly sets cookies on the **response** in `setAll` (not on the request), so the session cookie is written and sent back to the browser.

### 5. Middleware cookie handling
- **Problem**: Supabase docs show setting cookies on the response in middleware; our first version set them on the request.
- **Solution**: In `lib/supabase/middleware.ts`, `setAll` now calls `supabaseResponse.cookies.set(name, value, options)` so the session is persisted after auth.

---

**Repo**: [GitHub repository URL]

**Time limit**: 72 hours.
