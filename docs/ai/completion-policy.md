# Completion judgment and reporting policy (AI working principles)

What an AI agent must confirm before calling work "complete", and the format for reporting the result.

## Minimum bar for completion

All of these must hold before you can say "complete".

- The request's or Issue's requirements are met.
- No change exceeds the out-of-scope list stated in the Issue.
- The type check passes.
- Lint passes.
- The tests related to the change pass.
- The full test suite was run as far as possible.
- The build succeeds.
- For UI that handles data, the loading, error, and empty states are implemented.
- You read the diff of the change yourself.
- You confirmed no secrets or sensitive data are included, and checked the `NEXT_PUBLIC_` variables.
- You confirmed no `console.log`, `any`, or commented-out code was left behind.
- You confirmed no unrelated files are included.
- If the change requires a documentation update, the documentation was updated too.
- You checked the repository state with a final `git status`.
- You reported accurately what you actually did.

`npm run verify` covers the type check, lint, tests, and build in one command. Run it and report its actual output — never describe a command you did not run as passing.

## When not to say "complete"

If any of these apply, do not describe the work as complete.

- A test failed.
- A type error or lint error remains.
- The build has not been run yet.
- Only part of the requirements is implemented.
- An environment problem prevented verification.
- A commit or push the user asked for failed.
- A TODO or placeholder stands in for a core requirement.
- You built UI but could not see the actual screen. (Report this as "implemented, screen confirmation needed".)
- Changes unrelated to the request are mixed in.

## Status wording

State the outcome clearly as one of four.

```text
Complete       Every item on the minimum bar is satisfied
Partial        Only some requirements are met, or follow-up work remains
Unverified     Verification could not be performed for environment or permission reasons
Failed         The requirements were not met, or the attempt did not succeed
```

## Report format

The final report includes these items. Omit an item that is meaningless for the work at hand, but never invent one.

```text
1. Analysis
2. What was implemented
3. Files changed
4. Key decisions and assumptions
5. Verification performed
6. Verification results
7. Verification not performed
8. Commit state
9. Push and PR state
10. Remaining work and risks
```

## Principles

- Never report an Issue, commit, push, pull request, or test as complete if you did not actually create or run it.
- For verification you could not perform, say plainly that it was "skipped" or "not confirmed", give the reason (no permission, environment not set up), and include the command the user can run themselves.
- The AI cannot see a screen in a browser. Report the visual result, responsive layout, animation, and real accessibility behavior as unconfirmed items and ask the user to check them.
- If a PR needs a screenshot you cannot attach, leave the slot empty and ask the user. Do not phrase it as attached.
- If you find a problem during the work that falls outside the current scope, do not fix it on your own. Report it as a candidate for a follow-up Issue.
