# Standard AI workflow

The standard procedure an AI agent follows when doing work in the GETI-Client repository. This expands the "Required work order" in [`AGENTS.md`](../../AGENTS.md) step by step.

## Overall flow

```text
Confirm requirements
→ Check Git state
→ Explore relevant code and docs
→ Analyze blast radius
→ Form an implementation plan
→ Make the minimum change
→ Run related tests
→ Run full verification
→ Review the diff
→ Commit
→ Push or open a PR
→ Report the result
```

## Step criteria

### 1. Confirm requirements

- Do: read the user's request, the linked Issue body, the acceptance criteria, and the out-of-scope list carefully. For UI work, check the design reference (Figma link, screenshot) first.
- Don't: pull things into scope that were not asked for. Don't imagine a screen without looking at the design.

### 2. Check Git state

- Do: run `git status`, `git branch --show-current`, and `git log --oneline -10` to establish where you are and what is uncommitted.
- Don't: start editing files without checking the current branch.

### 3. Explore relevant code and docs

- Do: read the existing components, hooks, utilities, types, and tests first. Look in `shared` for common pieces before writing new ones.
- Don't: write something new without checking for an existing implementation. Don't rebuild a utility that lives a few files over.

### 4. Analyze blast radius

- Do: identify which slices, pages, and public APIs the change touches. If you are changing a shared component or anything in `shared`, check every call site.
- Don't: start implementing while the blast radius is still unclear. Don't fix a bug only on the screen named in the ticket and leave the sibling screens using the same function broken.

### 5. Form an implementation plan

- Do: write down what changes, why, and in what order. Decide which FSD layer each piece belongs to first. Split large scope into logical steps.
- Don't: mix several concerns into one unplanned edit. Don't create files before deciding on the layer.

### 6. Make the minimum change

- Do: implement only what the Issue and the request require. If the UI handles data, build the loading, error, and empty states with it.
- Don't: bundle unrelated refactoring, unnecessary component splitting, or an abstraction with a single call site.

### 7. Run related tests

- Do: run or write the tests matching the change first.
- Don't: skip tests and jump straight to the full build.

### 8. Run full verification

- Do: run `npm run verify`, which chains type check → lint → tests → build. The full script list is in the "Project commands" section of [`CLAUDE.md`](../../CLAUDE.md).
- Don't: assume partial verification means everything passed. Don't invent a script that is not in `package.json`, and don't report a pass you did not observe.

### 9. Review the diff

- Do: read the actual change with `git diff` and `git diff --staged`. Check for secrets, `console.log`, `any`, and unwanted files.
- Don't: commit without reading the diff.

### 10. Commit

- Do: stage only the related files and follow the Korean commit rules in [`git-conventions.md`](./git-conventions.md).
- Don't: mix unrelated changes into one commit. Don't slip a lockfile change into a feature commit.

### 11. Push or open a PR

- Do: push or create/update a PR only when the user explicitly asks. For UI changes, tell the user that a screenshot or GIF needs to be attached to the PR.
- Don't: push, merge, or force push on your own initiative. Don't report a screenshot as attached.

### 12. Report the result

- Do: report only what you actually did, in the format from [`completion-policy.md`](./completion-policy.md).
- Don't: describe verification or a push you did not perform as complete.

## Additional checks for Issue-based work

- Read the Issue title and body to understand the purpose of the work.
- Read the acceptance criteria to know what must be true for the work to be finished.
- Read the out-of-scope list to know what this round excludes.
- Confirm the current branch is the correct work branch containing the Issue number.
- Link the related Issue by number in the commit or PR body.
- Move the Issue's status label along with the workflow (see the status flow in [`git-conventions.md`](./git-conventions.md)).
- Leave a progress comment on the Issue at points worth reporting: a completed step, an intermediate commit, a change of direction. Do not comment on every minor intermediate state.
- If this work depends on another PR or Issue being finished, confirm that the prerequisite was actually merged first.
- If the work needs a backend API, confirm that API actually exists in [GETI-Server](https://github.com/inryeok-office/GETI-Server). If it does not, do not guess the response shape — ask the user.
