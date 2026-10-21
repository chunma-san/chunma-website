# Chunma · Sanctuary

Source for [chunma.xyz](https://chunma.xyz), a personal website for stories, public projects, and profile links.

## Features

- Black and crimson terminal-inspired design with original ASCII artwork.
- Browser-only terminal: `help`, `about`, `projects [query]`, `anime`, `manga`, `novels`, `links`, and `status`.
- Novel library and browser-local anime/manga imports.
- Public GitHub project directory with a saved fallback.
- Public Discord presence through Lanyard.
- Responsive layout, keyboard controls, and reduced-motion support.

## Run locally

No build or dependencies are required. Serve `dist/` with a static HTTP server, for example:

```sh
python -m http.server 8080 --directory dist
```

Open http://localhost:8080. Some public APIs may be unavailable or rate limited; the website retains its local content and project fallback.

## Security and data

The terminal navigates this website; it cannot execute operating-system commands. Imported library data stays in the visitor's browser. Never add API credentials, `.env` files, private server configuration, backups, or user data to this repository. Public API calls do not require private credentials.

`dist/_headers` contains security headers for compatible static hosts. The HTML also includes a content security policy. A different host must configure equivalent response headers itself.

## Publishing

The live website is published separately through its existing hosting workflow. This public repository is a source snapshot; pushing here does not automatically deploy to production. Hosting identifiers and deployment credentials are excluded.

## Analytics

Cloudflare Web Analytics is integrated using its public beacon site identifier. Reports are available only through the owner's Cloudflare account; no public counter or analytics dashboard is provided here. The beacon identifier is not an API credential and does not grant access to reports. Statistics begin after activation; they do not reconstruct earlier visits. Content Security Policy permits only the required Cloudflare script and collection origin alongside the existing services. Browser blockers can reduce measurements.

## Rights

No open-source license is granted by this repository. Third-party cover artwork and linked content retain their respective owners' rights.
