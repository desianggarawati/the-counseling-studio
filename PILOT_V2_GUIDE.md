# The Counseling Studio — Pilot V2 update

## What changed
- Invoice: **Create, Edit, Delete (with confirmation), Print**. Deleting invoice does **not** delete a payment. Existing invoice numbers are preserved on edit and are not renumbered after deletion. New invoice numbers derive from the highest existing invoice number; this is a demo numbering rule, not legal invoicing advice.
- Payment: **Create, Edit, Delete (with confirmation)**. Received totals recalculate after edits/deletions; payment confirmation remains independent from invoice printing.
- Client: structured session history remains linked by client ID, with new qualitative **Current Focus**, **Next Follow-up / Agreed Actions**, and **Next Follow-up Date** in client intake. These also appear in client history and PDF.
- Supabase sign-in **screen gate**: the main app UI remains hidden until Supabase authentication verifies the user.
- Cloud backup history: **optional SQL migration** archives the previous version of each modified cloud workspace snapshot, allowing deliberate revision restore from Cloud Setup.

## ACTION REQUIRED: enable historical backup
Run [backup-history.sql](./supabase/backup-history.sql) once using Supabase SQL Editor. **Without this step no history backups are recorded.** Existing old versions are not created retroactively. The trigger archives the previous payload whenever a cloud update changes its contents. It does not archive an initial insert or deletion of the full row. Monitor space usage and export offline backups too.

In Studio → Settings → Cloud Setup → **Cloud Backup & Recovery**, click **Refresh backup history**; after a later update you'll see stored revisions. **Restore to cloud** pauses Auto Sync on the device, asks confirmation, and restores the selected entire snapshot. Verify restored records and manually re-enable Auto Sync; other devices may need conflict resolution.

## Data security caveats
**STILL PILOT / TEST DATA ONLY.**
- Screen gate does **not** encrypt browser LocalStorage, secure an unlocked/shared phone, or remove cached cleartext data. Database RLS is required and configured in the Supabase project separately.
- Automatic cloud sync is a coarse whole-workspace snapshot model with revision conflicts, not a normalized, audited multi-user production database.
- There is no tested disaster recovery, data retention policy, comprehensive access audit, secure-at-rest on-device design, or legal/consent workflow.
- Never upload client details, PDF reports, birth records, or exported JSON backups to GitHub.
- If an actual client record has already been entered, restrict access on the device and migrate/erase appropriately only after a safe export and privacy review.

## Verification checklist (test records only)
1. Log in from laptop and iPhone.
2. Edit an invoice; confirm it retains its invoice number and displays the changed amount. Delete a test invoice and check other invoice and payment records remain.
3. Edit a payment and confirm Finance total recalculates; delete a test payment and confirm only the selected entry is removed.
4. Open Clients → Profile → Personal Info; add current focus/follow-up/date. Save. Open Consultation History and export PDF.
5. Run backup migration. Make a deliberate dummy edit, wait for Saved to cloud, then refresh backup history. Test restore **only after exporting a backup JSON** and ensuring there is no unsynced data on the other device.
