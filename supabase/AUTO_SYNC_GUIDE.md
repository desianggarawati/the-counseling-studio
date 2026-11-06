# The Counseling Studio — Automatic Cloud Sync (Pilot)

> **TEST DATA ONLY.** Sensitive client records are not yet approved for production use. LocalStorage is not encrypted, the app is public static hosting, and automatic sync is not a historical backup.

## Required one-time Supabase migration

Open **Supabase → SQL Editor** and run this file **after** the original `schema.sql`:

- [auto-sync.sql](./auto-sync.sql)

This adds `save_workspace_if_revision`, a row-level-security-respecting atomic database function that only updates a snapshot if its revision still matches the last revision seen by that device. It does not drop tables or delete client data.

## Enabling on each device

1. First use **Settings → Cloud Setup → Upload this device → cloud** from the device containing the preferred TEST records. (Only if no snapshot yet or after deliberate backup.)
2. Run SQL migration above once.
3. In **Settings → Cloud Setup**, ensure the device shows **Signed in**, then choose **Enable Auto Sync**.
4. This explicitly **downloads the latest cloud snapshot and replaces local demo data** on that device, after confirmation. Make a JSON backup first.
5. Repeat #3–4 on the next iPhone/iPad/laptop, signing in with the same account.

## Status & behavior

- Syncs on local changes after a short delay; checks the cloud periodically while the app is open, when it becomes visible, or when internet returns.
- Uses an optimistic revision check; two devices editing the same snapshot without receiving each other's changes will trigger **CONFLICT** on the stale device, never silent overwrite.
- On conflict: go to Settings → Cloud Setup → **Pause Auto Sync**, export a local JSON backup, and deliberately decide whether to **Load cloud → this device** (discard local divergent changes) or **Upload this device → cloud** (overwrite current cloud snapshot), then re-enable auto sync.
- Uploads use one JSON snapshot for the whole practice; this is NOT record-by-record merging, realtime collaboration, or cloud version history.
- Sync runs only while the web app is opened/active and authenticated. Closing the app or losing internet delays synchronization.
- **Never** enable auto sync simultaneously on two devices with diverging local test data before confirming which cloud snapshot is the canonical copy.
- Do not store private consultation data until production authentication gates, device-level data security, consent/privacy controls and recovery-safe backups are implemented.
