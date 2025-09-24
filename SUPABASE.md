Supabase Quickstart (Next.js)

1. Install the client

   npm install @supabase/supabase-js

or with pnpm:

pnpm add @supabase/supabase-js

2. Add environment variables

Copy `.env.local.example` to `.env.local` and set your project URL and anon key:

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional, server-only)

3. Usage

- Client-side (components):

  import { supabaseBrowser } from '@/lib/supabaseClient';

  // example: fetch rows
  const { data, error } = await supabaseBrowser.from('products').select('\*');

- Server-side (route handlers / server components):

  import { getSupabaseServerClient } from '@/lib/supabaseClient';
  const supabase = getSupabaseServerClient();

4. Quick test route

Start the dev server and visit `/api/supabase` — it will return whether your env vars are defined.

5. Notes

- Never commit your service role key. Keep `SUPABASE_SERVICE_ROLE_KEY` only in server environment variables.
- For auth and session helpers in Next.js, consider `@supabase/auth-helpers-nextjs` (optional).

6. Middleware (optional)

The repository includes a `middleware.ts` that protects common admin routes (for example `/admin`, `/dashboard`, `/products`, `/orders`, `/settings`). It checks for common Supabase auth cookies and redirects unauthenticated requests to `/login`.

Notes:

- The middleware performs a lightweight cookie check only. For a full verification you should validate the session server-side using the Supabase server client.
- Ensure your environment variables are set before using middleware (see step 2).
