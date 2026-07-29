# Security policy (AI working principles)

The security principles an AI agent must follow when working in GETI-Client. Implementing actual authentication and authorization is out of scope at this stage; this document covers the security of the AI's own work plus the exposure risks specific to a frontend.

## Secret handling

- Do not hardcode secrets, tokens, API keys, passwords, certificates, or private keys into code or configuration.
- Do not use a working secret value in an example or a document. Use an obvious placeholder such as `YOUR_SECRET` or `<token>`.
- Do not commit `.env`, certificates (`*.pem`, `*.key`, `*.p12`), or any other secret file. Do not remove entries already listed in `.gitignore`.
- When a new kind of local-only or secret file appears, consider adding it to `.gitignore` first.

## Browser exposure (frontend-specific risk)

Frontend code is ultimately delivered to the user's browser. Never assume a value is server-only.

- **Environment variables prefixed with `NEXT_PUBLIC_` are baked into the client bundle at build time.** Never put a secret, private key, or admin token in one. Only values that are harmless when public belong there (a public API base URL, a public analytics ID).
- Variables without the prefix are reachable only on the server (Server Components, Route Handlers, Server Actions). Passing such a value to a Client Component as a prop exposes it to the browser.
- When passing server-fetched data to a Client Component, pass only the fields you need. Do not hand over an entire user object and leak a password hash or an internal identifier.
- Do not put authorization checks only on the client. Hiding a button is a UI convenience, not security. The real check belongs on the server.
- Do not use `dangerouslySetInnerHTML`. If a requirement genuinely needs rendering external HTML, do not implement it on your own — ask the user.
- Do not introduce storing tokens in `localStorage` on your own. The authentication approach gets decided in a separate Issue agreed with the backend.

## Logging and output

- Do not print secrets or personal data (real user emails, phone numbers) in logs, commit messages, PR bodies, or completion reports.
- Do not read a file that may contain secrets (`.env`, certificates) in full and echo it into the conversation.
- Do not leave an API response logged with `console.log` and commit it. That exposes user data in the browser console.

## Authentication and authorization

- Do not remove or bypass authentication and authorization logic for testing or development convenience.
- At this stage, where authentication is not yet implemented, do not add a temporary bypass and leave it looking finished.

## External input and dependencies

- Do not trust user input or external data without validation.
- Do not use an externally supplied URL directly in an `href` or a redirect.
- Before adding a new dependency, check its origin and whether it is needed. Do not add many dependencies at once without justification. The npm ecosystem contains malicious packages with lookalike names, so verify the package name exactly.
- Do not download and run unverified external scripts. Do not use the `curl | sh` pattern.
- Do not load scripts directly from an external CDN.

## Shell and Git commands

- Check the blast radius before running a command that deletes or reverts files.
- The destructive commands listed in [`AGENTS.md`](../../AGENTS.md) — `git reset --hard`, `git clean -fd`, `git push --force`, `rm -rf`, and others — are not run without the user's explicit request. Some are blocked as `deny` entries in `.claude/settings.json`; do not construct a workaround to run them anyway.
- Do not interpolate external input directly into a command in a way that allows shell injection.

## Production and user data

- Do not access or modify a production API or database directly. Use the development environment or a mock for API calls during development.
- Do not use real user information as test data. Use values that are obviously fake.

## Reporting

- If you find yourself making a security-relevant assumption (for example, "this value is in plaintext because there is no secret management yet"), do not quietly move past it — state it in the completion report.
- If you find a security problem outside the scope of the current work, do not fix it on your own. Report it as a candidate for a follow-up Issue.
