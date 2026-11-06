# Supabase cloud sync — phase 1 (pilot)
**Status:** setup required; app stays in DEMO MODE until you connect your own Supabase project.

## Steps (do not send passwords or secret service-role keys)
1. Create a project at https://supabase.com/dashboard . Use an account you control.
2. SQL Editor → New query → paste `supabase/schema.sql` → Run.
3. Authentication → URL Configuration: set Site URL to `https://desianggarawati.github.io/the-counseling-studio/` and add this same URL as an allowed redirect URL.
4. Authentication → Providers → Email: enable email sign-in / OTP. Disable open sign-ups or restrict users before real-client use.
5. Project Settings → API: copy the **Project URL** and **publishable (anon) key**. These are designed to be public client values, **never** use `service_role` / secret keys in GitHub.
6. In Settings → Cloud Setup in the deployed app, enter URL and publishable key, request sign-in email, follow login link.
7. Test using dummy client records. Use explicit **Upload device to cloud** and **Load cloud to device** buttons. Neither runs automatically; loading overwrites local demo data after confirmation.

## Security and limitations
- GitHub Pages is public static hosting. Supabase Auth + RLS protect cloud rows, but **do not** prevent local browser data leakage on a shared/unlocked device.
- The application's localStorage still holds cleartext data. Do **not** use real private consultation records until local cache is redesigned, authenticated access gates all protected screens, privacy notices/consent and backup/restore have been tested, and security review is completed.
- The phase 1 schema is a single JSONB snapshot per authenticated user, convenient for prototyping, not a normalized production multi-user practice system.
- This is **manual transfer** between devices, not automatic or realtime sync. Export JSON backups separately; cloud is not a guaranteed historical backup.
- PDFs are created by browser print and are not uploaded automatically.
