# Response security headers

The production site serves its original static assets through a small Worker so security headers are applied to actual HTTP responses. A static `_headers` file alone does not configure every host.

The Worker sets Content Security Policy, nosniff, no-referrer, framing restrictions, Permissions Policy and a 180-day HSTS policy on this hostname. HSTS intentionally does not include subdomains or request preload enrollment. Existing analytics and public API connections remain allowed. No credentials or private service endpoints are used.

To produce an equivalent generic Worker from the static source, run `node scripts/build-worker.mjs`. The result is `build/worker.mjs`; deploy it using your host's Worker tooling. The hosting account, deployment identity, DNS configuration and credentials are intentionally excluded. This public repository does not automatically deploy the production site.

Verify response headers on the real deployment as well as successful HTML, CSS, JavaScript, images and JSON. Check HEAD, missing paths, and unsupported methods. Keep backups of the previous deployment for rollback.
