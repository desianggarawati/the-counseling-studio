# The Counseling Studio — Mobile PWA Demo

A responsive client management mockup for iPad, iPhone, and desktop. Features include Calendar, Clients, saved session notes by service and client, invoices, manual payments, and printable Client Summary / Full History with compact 11pt formatting.

## Publish with GitHub Pages

Repository **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.
Expected website URL: https://desianggarawati.github.io/the-counseling-studio/

On Safari iPhone/iPad: open the site, tap Share → Add to Home Screen.

## Security

**Demo only. Never enter real client information.** All records are saved in device browser localStorage. There is no authentication, server database, or multi-device sync. GitHub Pages hosts a publicly available site. Avoid committing client records, backups, birth details, consultation notes or invoices to the repository. Before production use, implement proper authentication, row-level security, private storage and tested encrypted backups (such as with Supabase).

PDF export uses the browser print dialog → Save as PDF.
