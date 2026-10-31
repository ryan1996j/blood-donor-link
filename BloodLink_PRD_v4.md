# BloodLink Product Requirements Version 4

Emergency blood donor discovery and donor account management

Version 4.0 | 1 November 2026 | Product owner and implementation team

BloodLink helps people find volunteer blood donors by state or region, township and self-reported blood group. Receivers search without an account. Donors use a nickname, control their availability and manage their own profile. The next implementation stage replaces the browser-only simulation with verified email accounts and a secure shared data service.

This version consolidates the approved product decisions and supersedes conflicting requirements in versions 2 and 3. The product owner approved email/password login, automatic return after a 90-day donation pause unless a manual break is selected, and phone display only after opening an available donor profile. The operational thresholds and implementation proposals identified below require validation before launch. Approval to write this PRD does not authorize a deployment or remote database change.

## 1 Purpose and product boundaries

The primary outcome is a usable contact discovery service that protects donors from unnecessary exposure and makes availability understandable. BloodLink does not collect, supply or reserve blood, determine medical eligibility, recommend blood compatibility, or guarantee that a donor answers a call. Hospitals and blood services remain responsible for donor assessment, screening and compatibility testing. The 90-day rule is a product availability rule and is not medical clearance.

The founder is nontechnical, is building with AI assistance and has no committed operating budget. Work must proceed in small reviewable stages, preserve the existing application, explain installations and external account setup, and avoid paid commitments without approval. A zero-cost prototype does not establish that a public service can operate indefinitely at no cost.

### Users and outcomes

- Receiver: find donors in the selected area and blood group, open a donor profile and obtain contact details without registering.
- Donor: create a recoverable account without a legal name or mandatory Google account, maintain an accurate profile, take a break, record a donation and delete personal information.
- Operator: respond to misuse, remove unsafe listings, monitor service health and complete deletion requests without unnecessary access to private information.

## 2 Current implementation and remaining work

The application uses React, Tailwind CSS and Vite in the demo folder. It runs locally at http://127.0.0.1:4173 while the development server is running. A local URL is not a public deployment and is not accessible from another device by that address.

Implemented demo features include Burmese and English, state/region and township selection, blood-group filters, donor cards and detail pages, profile creation and editing, take-a-break toggle, donation history with month/day/year selectors, 10-result batches and load more, and a centered creation confirmation with a View profile action.

The email signup, verification, login, logout and password-reset screens are simulations. They accept fictional .test addresses and the shared password demo-only-123. No real email is sent, passwords are not stored, and there is no secure authentication. Donor data and fake account mappings remain in browser localStorage. No Supabase project or database is connected.

Pagination fixtures add 58 available fictional donors in Yangon, Insein, O+, plus hidden and recently donated test cases. They are separate from saved profiles and can be removed with the test control. Existing sample donors can increase the visible total. Real phone calls remain disabled; opened profiles show only fictional DEMO numbers.

The latest local behavior preserves manual visibility separately from donation pauses. Historical hidden demo records remain hidden because their old data cannot reliably distinguish a manual break from an earlier donation-induced hide. Do not silently publish these records during migration.

Verification evidence at this baseline consists of a successful production build and 16 passing unit tests. Pagination was also exercised in the browser through 10, 20, 30, 40, 50 and 59 results, including filter resets. These checks do not validate real authentication, database policies, email delivery, real phone handling or production operations. Some older README passages describe superseded rules; this PRD is the intended product baseline.

## 3 Scope and delivery boundaries

### Shared data pilot scope

- Mobile-first receiver search without login; exact blood-group filtering; dependent location lists; 10-result batches; available donor detail and contact display.
- Email/password signup, email verification, login, logout, password recovery, session restoration and one donor profile per account.
- Nickname, private contact phone, state/region, township, blood group, donation history, manual availability preference and deletion controls.
- Server-enforced search eligibility, profile ownership, private contact access, abuse limits, moderation and operational monitoring.
- Burmese and English user-facing copy, understandable errors, accessible forms and consistent status messages.

### Deferred scope

Native Android/iOS applications, live GPS, precise home addresses, in-app calling, paid donor unlocks, compatibility recommendations, medical records, identity-document uploads, donor ratings and hospital integrations are deferred. Google sign-in is not required. Any future optional social login must not replace email access.

### Demo separation

Keep the existing demo usable until a test backend is verified. Connected mode must never fall back to editable demo identities after an authentication or database error. Do not upload browser-local fictional profiles or assign them to real accounts automatically. Remove sample credentials, test-user controls and fictional contact data from a real-donor deployment.

## 4 User journeys and interface requirements

### Receiver search

Open Find a donor, select a state/region, select one of its townships, and choose a blood group. Search updates the matching list without account creation. All-regions and all-townships options may be used intentionally; changing the parent region clears an incompatible township. The disabled township selector states that a region must be selected first.

Display total matching donors and how many are shown. Start with 10; Load more appends the next 10 or the remaining smaller batch. Reset to the first 10 when region, township or blood-group filters change, including when returning to a previously used filter combination. Preserve ordering within a search session and prevent duplicate cards.

If no donors match, explain the empty result and offer all townships within the same region while retaining the selected blood group. A separate Clear filters action resets all filters. Do not silently substitute a different blood group or claim medical equivalence. Results for adjacent areas require explicit user selection.

Cards show nickname, blood group, township, region and an availability label. They must not include a phone number in visible text, HTML attributes, hidden elements, structured metadata or search response JSON. Opening the card loads the donor detail and contact together after a fresh server eligibility check. No additional contact-unlock button is required by the approved flow.

### First donor account

Donate leads to Create account when logged out. Collect email, password and confirmation. Require a valid email and a configurable minimum password length; propose 12 characters for initial implementation. Do not request a legal name. Verify the email before allowing profile publication. Existing accounts are directed to login with neutral messages that avoid revealing account existence where practical.

Show a verification screen with resend, change-email and back-to-login paths. Resend is throttled and displays retry timing. Successful verification either establishes a valid session through the supported provider flow or clearly asks the donor to log in. A verified account without a donor profile is sent to the profile form, not an empty dashboard.

### Profile creation

Collect a nickname of 1 to 50 characters, phone number, selected state/region and township, selected blood group, and whether the donor has donated before. No blood group is selected by default. If Yes, require the most recent donation date through clearly labeled month, day and year selectors. Reject impossible and future dates; update day choices for month length and leap years.

Before saving, explain that the listing will be searchable and the phone will be visible to people who open it, subject to the donation pause or manual break. This is a notice at the creation action; the product owner explicitly removed the separate show-in-search checkbox. Record the notice/consent version and time. Any additional jurisdiction-specific consent requirement must be resolved before launch.

Email verification is not phone ownership verification. A real phone must pass an approved control check before being revealed. Saving an unverified phone creates a pending listing and explains the next step. After successful creation, stay on search with a centered success modal, a View profile action and Done. A paused or pending listing must receive a truthful success message explaining why it is not public yet.

### Returning donor

The top-right profile icon opens login when signed out, the profile form when signed in without a completed profile, and My profile when a profile exists. Login uses email/password and restores only that user's account. Retain valid sessions across refresh using the provider's supported session handling. Display clear expired-session and network-error states; never make a user select another donor as a login method.

The profile allows editing nickname, phone, location, blood group and donation history. Save indicates pending, success or failure. Prevent duplicate submissions. Changing a phone invalidates its previous control verification and removes public contact access until the replacement is verified. Hidden or paused owners can still read and edit their own private profile.

### Logout and password recovery

Logout clears the current application session and returns to search; it does not delete the profile. Clear private in-memory state and prevent a previous user's details from flashing when another user logs in.

Forgot password sends a time-limited reset link through the configured provider and shows the same outward acknowledgement whether an account exists or not. Handle expired, invalid, reused and wrong-browser links with a request-new-link action. Define the supported reset flow explicitly; if PKCE requires the originating browser, tell users before sending. Password update requires a valid recovery session and matching fields. After success, revoke sessions according to provider capabilities and ask the user to log in again. Never store passwords in application tables or logs.

### Language and accessibility

Persist the chosen interface language. Use plain Burmese and English labels; preserve the approved Burmese Donate label and nickname wording. Full Burmese state/region names and corrected Yangon township labels are display values, while place codes are the stored identity. All controls need labels, keyboard focus and text status beyond color. Target 48px touch controls, 320px screens and WCAG 2.2 AA testing; do not claim certification without an audit. Decorative hero artwork must not delay the search controls or block keyboard navigation.

## 5 Availability and the 90 day rule

### Independent state

Maintain manual_available as the donor's preference and last_donation_date as the most recent reported donation. Recording a donation changes the donation date and cooldown boundary; it must not set manual_available to false. Taking a break sets manual_available to false without erasing donation history. Turning availability on during a pause schedules willingness to return but cannot bypass the active pause.

Public eligibility requires every condition: verified account, publishable profile, verified current phone, manual_available true, donation pause ended or no donation history, not suspended and not deleting. Apply the complete predicate in search, detail and contact access. Hiding or suspension must take effect for subsequent requests even when an old search result remains open.

### Consistent date calculation

Proposed implementation specification: use Asia/Yangon as the service calendar, store the donor's reported calendar date, calculate cooldown_until as the start of that date plus 90 calendar days in Asia/Yangon, and store the resulting UTC timestamp for comparisons. The I donated blood button records today's date in that same calendar. Use server time, not the browser clock, for enforcement. Product/clinical reviewers must confirm this boundary before real launch.

The current demo uses its local timestamp/date helpers, including Asia/Bangkok formatting, so the production implementation must reconcile the timezone and date-only/button calculation rather than inherit them accidentally. An exactly 90-day boundary test is required. A background task may send reminders but is not needed for eligibility to update; the query itself compares the current time.

### State outcomes

- Available and no active pause: appears in search and opened detail may reveal the verified phone.
- Active pause and manual availability on: excluded until the boundary, then automatically returns without donor login.
- Active pause and manual availability off: excluded during and after the pause until the donor enables availability.
- Phone pending, suspended or deleting: excluded regardless of the date or toggle.

At the top of a paused owner's profile, show that the account is still saved, why search visibility is paused, the end date and remaining days. Keep the take-a-break section focused on the donor's choice rather than implementation details. After a recorded date correction, recompute the boundary on the server. Log only necessary change metadata, provide a way to correct mistakes and do not represent self-reported history as clinically verified.

## 6 Geographic data

The current snapshot contains 330 township codes and 18 source region/sub-region records, grouped into 15 top-level choices. Bago East/West and Shan South/North/East are grouped for the interface while preserving source identities in the imported snapshot. The data comes from a published MIMU-derived v9.4 layer; it is not a verified latest-release national registry.

Use fixed dependent lists with no township typing box in search, creation or editing. Store canonical township codes and validated parent region codes; reject cross-region combinations at the database boundary. Maintain separate English and Burmese names and source metadata. Name corrections must not change codes or detach saved donors.

The current Yangon list has 45 townships and includes eight approved Burmese label corrections. Tanintharyi has 10 township entries. Town and Township are different administrative levels; do not add town records as townships merely to increase the count. Before public launch, compare coverage with the current MIMU release, confirm redistribution/attribution conditions, review changes and preserve aliases or retirement mappings instead of silently dropping saved places.

## 7 Contact privacy and abuse handling

Search is public but contacts are not a downloadable public table. On opening a donor profile, make a bounded server request that checks eligibility and rate limits before returning the phone. The listing may become unavailable between search and opening; show an unavailable message rather than stale contact data. Opening an ineligible listing must not return its phone or private metadata.

The receiver remains anonymous. Introduce adaptive challenges and multiple abuse signals instead of requiring a receiver account. Proposed pilot starting limit: 20 contact-bearing profile opens per IP per hour, with additional per-session, per-donor and aggregate controls. Tune using shared-network tests; do not treat this number as proof against distributed scraping.

Rate limits must operate on every contact path, including origins and alternative APIs. Do not expose contacts through unrestricted Supabase REST, GraphQL, views, RPCs, previews, caches, analytics or downloadable exports. Contact-bearing responses use private no-store caching and are excluded from PWA service-worker storage. Privileged functions use fixed search paths and explicit execution grants. Secret/service credentials never enter browser code.

Explain that people can retain or redistribute a revealed number. Hiding and deletion cannot recall prior copies or prevent existing callers from calling. Provide a report function and operator suspension path. Reports should collect minimal evidence, not medical records. Define support coverage and escalation ownership before inviting real donors.

## 8 Data model and authorization

This is a logical specification, not a migration already applied. Inspect the intended Supabase project before writing executable migrations. Reuse compatible existing structures; do not drop or overwrite tables, policies or data without explicit approval.

### Entities

- auth.users: provider-managed account ID, email, verification and password credentials. Application code never stores a second password copy. Email is not a public profile field.
- regions: stable app code, source code mapping, English and Burmese names, dataset version and active state.
- townships: Pcode primary key, validated parent region, bilingual names, aliases and source lifecycle metadata.
- donor_profiles: ID, unique immutable owner account ID, nickname, blood-group allowlist value, township foreign key, manual availability, consent version/time, created/updated timestamps and lifecycle state.
- donor_contacts: profile ID, private normalized phone, control-verification state/time, and invalidation metadata. Phone changes require reverification.
- donor_availability: profile ID, most recent reported donation date, computed cooldown_until and minimal correction metadata. This can be a private extension of profiles if the authorization boundary stays clear.
- abuse_reports and moderation_events: listing reference, minimal reason/evidence, workflow state, operator action and restricted access.
- deletion_jobs: profile/account reference, suppression time, cleanup stage, retry state and completion time, with minimal retention.

### Authorization contract

Enable RLS on exposed tables. A donor's private SELECT must allow their own hidden profile. INSERT and UPDATE must bind immutable ownership to auth.uid() with both row access and new-value checks as appropriate. Do not trust a user_id sent from the browser. Deny owners permission to set phone verification, suspension or administrative fields through generic updates.

Anonymous clients have no direct access to private contact, donation, email or deletion records. Public search and detail use reviewed projections/server endpoints. A server using a service-role credential bypasses RLS and must independently authorize the caller and operation. Test the actual API surfaces, not just whether buttons are hidden.

One donor profile per account is enforced with a unique constraint. Use UUIDs, timezone-aware timestamps, normalized phone values, blood-group checks and location foreign keys. Propose one active profile per verified phone, with a reviewed conflict and reassignment process rather than silently allowing a malicious overwrite.

## 9 API and system architecture

Retain the current React/Tailwind/Vite application. Add Supabase Auth/PostgreSQL and the smallest appropriate server layer, such as reviewed edge functions, for contact access and privileged cleanup. Do not rewrite the framework as a prerequisite. Keep development/test and production data distinct.

GET search accepts bounded region, township and blood-group filters plus an opaque pagination cursor; it returns at most 10 cards, a consistent order/cursor and a defined total or clearly labeled approximate count. Keep ordering stable for each search. Exact totals and paging must use the same eligibility predicate. Concurrent hides/deletions may reduce a later batch; never reintroduce ineligible records to fill a page.

An opened-profile endpoint returns public detail and eligible contact after rate-limit and fresh-state checks. Prefer an explicit POST for contact-bearing opens to reduce link-prefetch reveals. The phone is delivered only in this response, not preloaded by search. Public profile rendering must not trigger uncontrolled email or phone sharing through third-party resources.

Authenticated create/update endpoints derive account identity from validated sessions. Donation recording and history correction recompute the server cooldown. Delete account requires recent authentication and confirmation, suppresses access first, and queues cleanup. All endpoints validate input and return comprehensible loading, empty, retryable and forbidden states. Avoid false success when a write fails.

Use managed auth session handling, documented redirect protection, input validation and appropriate XSS/CSRF defenses for the chosen session transport. Set exact local and deployed redirect allowlists. Publishable project configuration can be in the client; database passwords, secret keys and SMTP credentials belong only in protected server/provider settings. Do not request the founder's account password in chat.

## 10 Deletion retention and recovery

Take a break is reversible and preserves the profile. Delete profile removes the listing while leaving the login account only if the UI clearly explains this distinction. Production must also offer Delete account and donor information; do not label profile deletion as full account deletion.

After a confirmed account-deletion request, atomically suppress search and contact access and prevent republishing. Revoke sessions according to provider capabilities. Retry cleanup of profile, contacts, private donation history, account credentials and controlled caches. Partial failures remain suppressed and visible to operators. Never expose an administrative key to let the browser delete auth users directly.

Proposed retention targets, pending provider and local-policy review: active personal data removed within 24 hours; restricted operational logs without raw phone, password or token data retained up to 30 days; backups expire within 30 days. Implement a minimal deletion ledger that is reapplied before restored systems serve traffic. Document purpose, access and expiry for any exception. Do not promise deletion from recipients' phones or immediate erasure of all backup copies.

## 11 Acceptance criteria

- AC01 Receiver search works without login; only eligible donors match exact selected place codes and blood group.
- AC02 Region changes clear township selection. All creation/editing locations come from the same list, and the database rejects cross-region input.
- AC03 Blood group begins unselected and profile submission cannot silently default to O+.
- AC04 A first signup requires email verification; a returning donor reaches only their own profile, including when it is hidden or paused.
- AC05 Unverified user, anonymous visitor and user A cannot read or modify user B's private row using any direct API. Ownership changes are rejected.
- AC06 Forgot-password acknowledgement is neutral. Valid recovery changes the password; expired, reused and invalid links do not. No password/token reaches application logs.
- AC07 Impossible/future donation dates fail. Date selectors handle leap years and month changes; date entry and I donated blood use the same documented calendar rule.
- AC08 A profile is excluded immediately before cooldown_until and automatically eligible at or after it when manual availability remains on. No login or cron run is required.
- AC09 A manual break persists during and after the pause. Switching the preference on cannot expose a donor before the cooldown ends. Both choices survive reload and device changes.
- AC10 The paused profile clearly says the account is saved and shows the return date; user-facing status remains understandable in both languages.
- AC11 Search responses/cards contain no phone/email/private donation data. Opening an eligible profile displays the phone; hiding, suspending or deleting it blocks a subsequent open.
- AC12 Contact limits cannot be bypassed through direct origin, REST, GraphQL, RPC or an alternative detail route. Cached content never reveals a newly hidden phone on a fresh access.
- AC13 The 58-donor fixture paginates 10/20/30/40/50/58 with no duplicates; existing matches may increase totals. Filters reset to 10, final partial batches are correct, and hidden/paused cases are excluded.
- AC14 A phone change makes its previous verification invalid. An unverified replacement is never disclosed. A conflict does not overwrite another donor's phone ownership.
- AC15 Account deletion suppresses access immediately and completes within the approved target; retries and backup-restore tests keep deleted accounts suppressed.
- AC16 Losing connectivity does not show a saved state falsely or create a duplicate profile. Configured backend failures never activate demo login.
- AC17 Real signup/recovery email delivery succeeds with the intended test recipients and redirects. Public launch contains no shared demo password or fixture controls.

## 12 Nonfunctional targets and verification

Proposed pilot performance targets: p95 search endpoint below 500ms under an agreed 50-concurrent-search load and representative 100000-row synthetic data; p75 usable search page below 3 seconds on an agreed midrange phone and throttled mobile connection. Measure end-to-end contact discovery separately from database execution. Targets require testing and are not guarantees.

Propose 99.5 percent monthly search availability for a limited pilot, measured independently. Define backup restore objectives after provider selection and rehearse restoration before launch. Load testing must include rate-limit stores, auth redirects and contact reads, not search alone. Hosting/network reliability and native dialer links do not guarantee call completion.

Record aggregate search failures, empty searches, profile-open failures, auth failures, delivery errors, abuse reports and deletion completion. Do not record raw contact numbers, passwords, recovery tokens or sensitive request bodies in analytics. Review accessibility with keyboard, screen reader and mobile layouts in both languages. Check every region's list for truncated names, duplicate codes and orphaned locations.

## 13 Delivery plan and budget controls

### Stage A Requirements and code alignment

Product owner approves this baseline and unresolved pilot proposals. Reconcile old README text, donation date/timezone behavior and public/private boundaries. Save a Git checkpoint. Do not import demo data into real accounts. This stage is documentation and test preparation, not database activation.

### Stage B Test project and verified email access

Create/select the founder's Supabase test project, review existing objects and configure email/password with verification. Configure an appropriate sender and exact redirects. Prepare reviewed migrations, environment examples without secrets and bilingual auth states. Run two-user ownership tests before attaching real contact information.

### Stage C Shared profiles and protected contact

Connect profile CRUD, location constraints, independent manual availability and server-derived cooldown. Add bounded server pagination and the contact-bearing profile endpoint. Add phone control checks, origin protections and request limits. Retain login-free receiver access. Do not equate frontend pagination with a scalable database implementation.

### Stage D Operations and private pilot

Implement deletion jobs, moderation, monitoring, restoration and incident response. Complete security review and a limited pilot with consenting donors in selected townships. Resolve high/critical findings before expanding. A code build alone is not a launch gate.

The founder owns product choices, external accounts and spending approval. The implementer owns migrations, code and technical checks. A designated technical reviewer validates security; an operator handles verification, abuse and deletion. The founder may fill multiple roles but must explicitly cover them. No delivery-date commitment is made for a single nontechnical founder; schedule each stage after its prerequisites and tests are understood.

No paid budget is authorized. Track expected hosting/database, sender/domain, phone verification, monitoring, support and security-review costs before external activation. Free-tier limits, usage charges and service terms must be checked at purchase/setup time rather than copied as permanent promises. If a required paid service has no approved funding, keep the project in a fake-data test environment.

## 14 Launch gates risks and open decisions

Launch gates: verified recoverable accounts; all owner/private-access tests passing; consent and phone control workflow operational; latest location coverage reviewed; consistent 90-day server rule; contact limits effective; full account deletion and restoration rehearsed; bilingual usability/accessibility review completed; no critical/high security findings; monitored and funded support coverage; and no real-data exposure through demo paths.

Major risks are phone harvesting, unwanted calls, fake phone submissions, stale availability after automatic return, credential recovery failure, local-clock/date mistakes, truncated location names, misinterpreting availability as medical suitability and accidental migration of fake data. Mitigate through controlled detail access, phone control checks, prominent break controls, server time, source review, truthful medical boundaries and isolated environments.

Automatic return after 90 days is approved; adding a separate inactivity-expiry rule is not. The previous version's blanket 30-day expiry is not carried forward silently because it could prevent the approved automatic return. Any future reconfirmation expiry needs an explicit product decision.

Before real launch, resolve: phone verification method and cost; abuse/support coverage; operator permissions; jurisdiction and age policy; consent/retention obligations; contact rate-limit tuning; source redistribution terms and current MIMU import; hosting region/provider limits; session revocation strategy; and the proposed Asia/Yangon calendar boundary. These are launch dependencies, not evidence that the demo already implements them.

If contact privacy controls fail, disable contact disclosure while retaining owner hide/deletion access where safe. Investigate, correct and retest before reopening. Releasing new features or publishing to GitHub/hosting remains a separate user instruction; generating this document does not publish anything.

## 15 Continuity and source references

Repository: https://github.com/ryan1996j/blood-donor-link . Application directory: demo. Start with npm.cmd ci and npm.cmd start inside demo; verify with npm.cmd test and npm.cmd run build. The last confirmed GitHub commit before the newest availability/contact changes was 2875dfa. Local changes must be reviewed before a future push. Browser-local demo profiles are not backed up by Git commits.

When handing off to another developer or AI, supply this PRD, the repository, setup README, location provenance and test results. Ask the new implementer to inspect the code before changing it, preserve approved behavior, distinguish simulation from real security, and avoid requesting passwords or uploading private data. Versions 2 and 3 remain historical references; their mandatory Google/anonymous-recovery and manual-return assumptions no longer control this version.

Primary references checked on 1 November 2026:

- Supabase password authentication: https://supabase.com/docs/guides/auth/passwords
- Supabase email sender restrictions and custom SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- Supabase authorization: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
- MIMU place codes: https://themimu.info/place-codes
- Imported layer provenance: https://services.arcgis.com/pGfbNJoYypmNq86F/ArcGIS/rest/services/Myanmar_EQ_RNA_data/FeatureServer/0
- WHO blood safety and availability: https://www.who.int/news-room/fact-sheets/detail/blood-safety-and-availability

Supabase documentation describes provider behavior; configuration and tests must prove the implementation. The default hosted sender restricts recipients, so verify a suitable delivery configuration before inviting ordinary donors. WHO supports the hospital/blood-service screening boundary, not BloodLink's chosen 90-day product policy. MIMU-derived data is reference material rather than a guarantee of current completeness.
