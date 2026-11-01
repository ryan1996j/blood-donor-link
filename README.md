# BloodLink

**Live website:** [Open BloodLink](https://blooddonor1.netlify.app/#)

A mobile-friendly blood donor finder demo built with React, Tailwind CSS and Vite, with Burmese and English support.

**Fictional data only.** Login is simulated, calling is disabled, and profile changes stay in browser storage. This is not a production service.

## Run locally

Install Node.js, then open a terminal:

```powershell
cd demo
npm.cmd ci
npm.cmd start
```

Open http://127.0.0.1:4173/. Keep the terminal running; press Ctrl+C to stop.

## Features

- Township and blood group search, donor cards and public profile pages.
- Create donor profile beside Find a donor.
- Top-right profile icon for demo login and profile management.
- Edit nickname, fictional phone number, township, blood group and availability.
- Hide/show and delete profiles with confirmation.
- Donation confirmation hides a donor for 90 days, followed by manual reactivation.
- Browser-local persistence, reset, and Burmese/English language switching.

## Verify

```powershell
cd demo
npm.cmd test
npm.cmd run build
```

See [demo instructions](demo/README.md) for details. Product requirements are retained in the version 2 and version 3 Word documents in this repository.

## Limits

There is no real authentication or database. Anyone can select any fictional donor. Demo phone numbers use `DEMO-1234` format. The 90-day pause uses the local computer clock and is not medical clearance. A real launch needs secure authentication, server-enforced access and timing, contact verification, privacy controls and security review.
