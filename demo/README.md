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
3. Click the profile icon at the top right to open demo login. Select a fictional donor and continue; the same icon then opens My profile. This is simulated login, not secure authentication.
   To create a new profile, use Create donor profile beside Find a donor. Fill in the fictional nickname, demo phone, township and blood group. The profile starts hidden and opens in My profile after creation.
4. Edit nickname, township, or blood group, then save.
5. Hide a profile and check that it disappears from search. Show it to restore it.
6. Delete a profile. Cancel keeps it; Confirm removes it.
7. Refresh: edits persist in this browser when storage is available.
8. Reset demo restores the eight original profiles, including one hidden profile.
9. Edit the demo phone using `DEMO-` followed by 4–8 digits. Real phone numbers are not accepted or displayed publicly.
10. Click I donated blood and confirm. Search excludes that donor for exactly 90 days from the recorded timestamp. Availability cannot be enabled during the pause. After it ends, choose Show profile to return to search. This is an app rule, not medical clearance.
11. Open View donor profile on a search card to see the public profile. Donation history and demo contact details remain in the management view.

Browser storage is local to the browser and address used. A private window or another browser has separate data. Clearing browser data removes edits. Do not enter real names or personal information. Anyone using this demo can select any fictional donor at demo login; this is intentional and is not authentication. Reloading logs out of the simulation but retains saved edits and donation timestamps. Timing uses this computer's clock; real deployment needs server-enforced dates and ownership checks.

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
