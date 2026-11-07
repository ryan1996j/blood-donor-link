# BloodLink moderation integration

Migration 006 was applied to the approved Supabase project on 2026-11-07. Do not rerun. Admin membership was separately assigned to the verified owner with explicit approval; no role assignment credentials are stored in the frontend.

The production build enables VITE_MODERATION_ENABLED through netlify.toml. The server verifies admin membership for every decision. New tables have RLS and no direct anonymous/authenticated grants. Verified users can submit reports. Donors see only their own notices and review requests, without reporter identity.

Accept report temporarily removes a profile from public search/open endpoints. Reject report leaves availability unchanged. Suspended owners can edit their profile and request review; only an admin can restore it. Suspension is keyed to the auth user and survives profile deletion/recreation. Restoration preserves manual rest and the 90-day donation pause. Decisions require donor messages and are recorded in history.

Validation: local PostgreSQL permission/rollback tests, full app tests and production build; hosted metadata and rollback-only role checks; user-tested report, decision, request review and restore flow. Hosted tables initially contained no reports or suspensions at migration verification. Public signup email delivery remains dependent on custom SMTP setup; this release does not resolve email sending limits. Calling remains disabled and contacts remain DEMO-only.

Standalone local preview pages are not part of this release. Existing search, profile saving and authentication workflows are retained; this release adds email instructions and approved form styling.
