# Planner privacy and deployment guardrails

## Implemented in the app

- Shared-password access uses the server-only `NITRO_PLANNER_PASSWORD` secret. Missing configuration fails closed. Never use a `VITE_` variable for this password.
- Eight-hour signed sessions use HttpOnly, Secure production cookies and SameSite=Strict. Password rotation invalidates existing sessions. Session validation rejects malformed, expired and excessively long-lived tokens.
- API routes other than `/api/access` require a valid session. State-changing API requests require a matching Origin and reject cross-site requests. API responses are marked no-store.
- The login endpoint has an in-process 20-request/minute cap. This is only a supplemental limit: Vercel instances do not share its counter.
- JSON and CSV downloads require a warning/confirmation. Files are unencrypted.
- Vercel response headers restrict scripts and API connections to the same origin, disable unused browser capabilities, prevent content-type sniffing, suppress referrers, request no indexing and require HTTPS on subsequent visits.
- Google Fonts and the B-Line logo host remain allowed for existing assets. These services can see network metadata. CSP does not encrypt stored data.

## Required hosting controls (not enabled by changing app files)

Live inspection found project `microhub-growth` serving production commit `cf622ff44e6557cbd571ba1017f4304c19765d38`, which predates the security hardening. The public production URL `https://microhub-growth.vercel.app` returned the application's shared-password screen. The repository configures response headers, but their live presence has not been verified: the deployment fetch timed out.

Vercel project metadata reports SSO protection enabled with scope `all_except_custom_domains`, hosting password protection disabled, and trusted IPs disabled. This does not establish that every production/alias URL is protected. Active firewall inspection failed: the unscoped lookup returned 404 and the explicit team-scoped lookup returned 403 for `dabblejs-projects`. No hosting settings were changed. An authorized team administrator must verify the active rules and production protection scope.

In Vercel, verify that the deployment runs the Nitro API handlers and the production headers are present after deploying the security changes.

1. Enable Deployment Protection for the production URL and all preview/deployment URLs if all code and seeded references must be private. Protecting only previews leaves the production bundle public. Availability and pricing depend on the Vercel plan.
2. Configure a Vercel Firewall rate-limit rule for `POST /api/access`, keyed by client IP, with a 20-request/minute limit and a 429 action. Review availability and cost before enabling paid features.
3. Review firewall events and existing managed protections. Do not rely on the in-process login counter as a distributed firewall.
4. Keep the shared password long, randomly generated and limited to authorized team members. Rotate it when team membership changes or exposure is suspected.

Capability review: Vercel documents automatic DDoS mitigation, custom WAF rules and fixed-window rate limiting on all plans, subject to plan limits. Rate-limit counters are regional, not globally shared. Deployment Protection is separate from WAF rules; Standard Protection does not protect the current production domain. Confirm the selected protection scope explicitly includes production.

References: [Deployment Protection](https://vercel.com/docs/deployment-protection), [Firewall rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

No trusted-IP restriction has been configured. No frame-ancestor restriction has been configured because the app is used in an embedded preview; a production embedding allowlist needs explicit approved origins.

## Data boundaries

Workspace edits are saved in this browser profile's localStorage, not uploaded to a shared database. Anyone with access to that browser profile can read them. Signing out does not delete them. Exported files, backups and printed output must be handled as private data.

The application gate hides the interface; it does not protect static HTML, JavaScript or bundled seed/reference data. Search-engine headers are advisory, not access controls. Use deployment-level protection for those resources. A shared password has no per-user audit trail, account revocation or MFA.
