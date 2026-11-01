# BloodLink local demo

React + Tailwind CSS + Vite. Fictional donors only. No real accounts, database, phone numbers, or calling.

## Open the demo

Open a terminal in this folder and run:

```powershell
npm.cmd start
```

Open http://127.0.0.1:4173 in your browser. Keep the terminal running. Press Ctrl+C to stop it.

If dependencies are missing on a new computer, run `npm.cmd install` once first. This downloads free packages and requires an internet connection. Node.js must be installed.

## Things to try

1. Filter by township and exact blood group.
2. Switch between English and Burmese with the top-right button.
3. Click the top-right profile icon to open the email login UI demo. Use `donor1@example.test` and `demo-only-123` for Golden Leaf. The same icon then opens My profile. This is simulated login, not secure authentication.
   To create a new profile, use Create donor profile beside Find a donor. Fill in the fictional nickname, demo phone, township and blood group. The profile appears in search after creation. A success alert appears on the search page; use the top-right profile icon to manage the profile later.
4. Edit nickname, township, or blood group, then save.
5. Hide a profile and check that it disappears from search. Show it to restore it.
6. Delete a profile. Cancel keeps it; Confirm removes it.
7. Refresh: edits persist in this browser when storage is available.
8. Reset demo restores the eight original profiles, including one hidden profile.
9. Edit the demo phone using `DEMO-` followed by 4–8 digits. Real phone numbers are not accepted or displayed publicly.
10. Click I donated blood and confirm. Search excludes that donor for exactly 90 days from the recorded timestamp. Availability cannot be enabled during the pause. After it ends, choose Show profile to return to search. This is an app rule, not medical clearance.
11. Open View donor profile on a search card to see the public profile. Donation history and demo contact details remain in the management view.

Browser storage is local to the browser and address used. A private window or another browser has separate data. Clearing browser data removes edits. Do not enter real names or personal information. Anyone knowing the displayed shared demo password can open these fictional profiles. This is intentional and is not authentication. Reloading logs out of the simulation but retains saved edits and donation timestamps. Timing uses this computer's clock; real deployment needs server-enforced dates and ownership checks.

## Checks

```powershell
npm.cmd test
npm.cmd run build
```

The production build is written to `dist`. Nothing is published by these commands. The local server listens only on this computer, so the URL will not open from a separate phone.

## Files

- `src/main.jsx`: React interface and interactions.
- `src/data.js`: fictional donors and filter rules.
- `src/translations.js`: Burmese and English text.
- `src/style.css`: Tailwind import and visual styling.
- `vite.config.js`: Vite and Tailwind setup.

Real donor registration, recovery, private contact storage, verification, and security review are future work.

## Location selectors

Choose a state/region first, then select a township from its complete dropdown list. There is no township typing box. Changing state/region clears the township selection. The same source list is used in search, profile creation and editing. Existing demo records are converted to location codes on load.

See [location data provenance](LOCATION_DATA.md) for source version, attribution and public-launch limitations. This local demo uses a MIMU-derived v9.4 snapshot, not the latest release.


## Legacy email account UI demo (only when Supabase is not configured)

Without the environment configuration below, no database or real email sender is connected. Only fictional `.test` addresses are accepted. Use the shared password `demo-only-123`; no passwords are stored.

- Donate opens account creation when logged out. Enter a new `.test` email and the shared demo password twice.
- Click Simulate email verification, then log in with the same address and demo password to complete the donor profile.
- Existing samples use `donor1@example.test` through `donor8@example.test`. Previously created custom demo profiles receive additional `donorN@example.test` mappings in browser storage.
- Forgot password opens a simulated inbox and reset form. No email is sent and the shared demo password remains unchanged.
- Reload logs out of the UI simulation but preserves fake email-to-profile mappings and profile edits in this browser. Reset demo restores original profiles and sample accounts.
- These client-side screens do not provide real ownership protection or authentication. Never enter real emails or passwords.


## Search result batches

Search shows 10 matching donors initially, with a visible/total count. Load more adds up to 10 at a time. Changing state, township or blood group resets the displayed batch; Clear filters does too. All data still comes from browser-local storage; this is UI pagination, not server-side pagination. Existing sample profiles are unchanged. The load-more control only appears when there are more than 10 matches. Unit tests include a 58-donor fixture without adding it to saved sample data.


## Approved availability and contact behavior

Visibility is the donor’s preference, separate from the automatic 90-day donation pause. Recording a donation preserves that preference. A donor who has left availability enabled returns automatically at the 90-day boundary; a donor who selected a break stays hidden. Existing hidden profiles stay hidden, because the old data does not reliably distinguish a manual break from an old donation-induced hide.

Search cards contain no phone numbers. Opening an available donor profile displays its fictional `DEMO-` contact number. Hidden and paused profiles cannot reveal contact through this view. This is browser-only display logic, not server-side privacy protection; real contact data must not be entered.


## Supabase test integration (current local configuration)

The official Supabase JavaScript client is installed. Copy `.env.example` to `.env.local` and enter the project URL and publishable key. These are public browser configuration; never use a secret/service-role key. `.env.local` is ignored by Git. Restart `npm.cmd start` after configuration changes.

When configured, the donor/profile entry points use real email/password signup, login, logout and email recovery. Verified owners can load, save, edit and delete their private donor profile and fake contact. The legacy local accounts are not migrated and do not work with real login. Public search remains entirely fictional and local; cloud profiles do not appear in it yet. Profile deletion leaves the login account intact. Demo reset never deletes cloud records.

Live hosting: `https://blooddonor1.netlify.app/`. Supabase Site URL and the exact redirect allowlist entry now use this live URL. Netlify has the public project URL and publishable key configured as build environment variables. Keep confirmation enabled. Email delivery requires an allowed test recipient or custom SMTP; inspect Supabase's SMTP restrictions before inviting users. No mail credentials belong in frontend environment variables. Old invitation emails may retain old redirect destinations; use a fresh link. Invitation callbacks open the set-password form, with password entry performed by the account owner.

For a manual test, register your own email with a unique password of at least eight characters, confirm the email on this computer with the server running, then save a fictional nickname and `DEMO-1234` contact. Reload, log out/in, edit, take a break and record a donation. The cloud pause ends at Yangon midnight on donation date + 90 days. Finally test email recovery and two separate accounts: account B must not see or edit account A's saved profile/contact. These live email and two-account checks remain pending user participation; automated build and tests do not establish that email delivery works.

Profile and contact writes use two requests. If the profile succeeds and the contact fails, the UI reports the partial save and reloads the owner data for retry. No public read policy or search/contact RPC was added in this stage. Full account deletion, contact reveal protection and public search remain future work.
