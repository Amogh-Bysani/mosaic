# Mosaic implementation status

Last audited: July 21, 2026

## Completed

- Credential-free `/demo` route with bundled business and engineering sample sources.
- Normalized tile geometry, drag, resize, bring-to-front, focus, minimize, scenario switching, and layout undo foundations.
- Human-reviewed Copilot proposal flow with Apply and Dismiss.
- Strict server input validation and structured OpenAI response parsing.
- Deterministic layout fallback when OpenAI is unavailable or returns invalid output.
- Server-only Zoom Video SDK token signing with bounded input fields and a two-hour expiry.
- Isolated Zoom multi-share proof route.
- Clear SAMPLE/GUIDED DEMO and LIVE labeling.
- Baseline automated tests, lint, type checking, and production build.
- Independent Personal and Shared Canvas snapshots with explicit host publication and Apply Host Layout.
- Explicit focus restore, selected-tile reopen, reset layout, and completed-action undo.
- Deterministic Copilot handling for focus, minimize, restore, comparison, show-all, and scenario-switch requests.
- Proposal review details: affected sources, bounded actions, focus order, rationale, and decision prompts.
- Versioned compact command validation for payload size, stale messages, unknown IDs, and host publication permission.
- Geometry conversion, bounds/minimum enforcement, and severe-overlap proposal rejection.
- Expanded automated coverage: 20 tests across 6 files.

## Partially complete

- Canvas history: completed drag, resize, focus, minimize, reopen, reset, and proposal actions are recorded; continuous pointer movement is intentionally not recorded.
- Caption flow: a clearly labeled simulation exists, but not the requested bounded capture state machine.
- Zoom spike: join and incoming share attachment exist, but participant state and event/DOM cleanup need hardening.
- Low-frequency sync: compact commands and permission/version policy are tested, but no live session channel adapter is implemented.

## Missing

- Complete route/store/caption/token test coverage.
- Submission documentation, demo script, judge guide, and deployment instructions.
- Public deployment, public repository URL, demo video, and primary Codex session ID.

## Broken

- `/workspace/[roomId]` is labeled live but currently renders sample canvas content and does not integrate Zoom media.

## Blocked externally

- Real Zoom share verification requires Video SDK credentials, browser capture permission, and two clients.
- GPT-path verification requires an OpenAI API key; the credential-free fallback path is available.
- Public deployment, repository push, and video publication require authenticated external accounts.
