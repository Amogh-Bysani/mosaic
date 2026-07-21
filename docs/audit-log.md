# Mosaic audit log

Last audited: July 21, 2026

Resolution update: the Critical Shared-state finding and the Guided Demo, geometry, history, deterministic Copilot, proposal UI, command-policy, setup, and core test findings were fixed in the July 21 stabilization pass. Zoom lifecycle, live transport, full caption capture, and broader API mocking remain future milestones.

| Severity | Area | Finding | Proposed fix |
| --- | --- | --- | --- |
| Critical | Shared state | Personal and Shared modes point at the same tile array, so switching modes does not isolate participant layouts. | Maintain independent Personal, Shared draft, and host-published snapshots; copy only on explicit actions. |
| High | Guided demo | Minimized tiles call global Undo, potentially restoring an unrelated layout. | Add an explicit reopen action scoped to the selected tile. |
| High | Guided demo | Focus has no explicit restore control and reset layout is absent. | Store focus snapshots; add Restore and Reset controls with history. |
| High | Copilot | The deterministic fallback ignores most documented commands and only returns a scenario preset. | Add a deterministic intent parser before optional GPT orchestration. |
| High | Live claims | The live workspace route does not mount Zoom sources despite its LIVE SESSION badge. | Label it as a live-preview canvas until integration is complete and document the separate verified spike. |
| High | Zoom lifecycle | Share listeners and attached media nodes are not comprehensively cleaned up. | Use stable handlers, detach all share views, remove listeners, stop local share, and leave on unmount. |
| Medium | Geometry | Validation checks outer bounds but not severe overlap. | Add pairwise overlap limits and deterministic repair/fallback. |
| Medium | History | Drag, resize, minimize, and bring-forward do not create consistent undo entries. | Route completed actions through one snapshot-aware store transition. |
| Medium | Proposal UI | The proposal omits affected sources, actions, focus order, and decision prompts. | Extend the proposal contract and render the additional review details. |
| Medium | Captions | Simulation uses an untracked timer and has no rolling buffer/state limits. | Add pure caption helpers, bounded capture state, and timer cleanup. |
| Medium | Commands | Compact messages lack version/staleness and permission handling. | Add versioned canonical messages and a reducer that rejects stale or unauthorized publication. |
| Medium | Tests | Only five pure-function tests exist. | Add geometry, store, deterministic parser, captions, API validation, and sync tests. |
| Low | Setup | `.env.example` is referenced but missing. | Add a safe placeholder-only example file. |
| Low | Maintainability | Core components and CSS are highly compressed. | Reformat touched files while preserving the architecture. |

## Baseline verification

- Dependency installation: packages installed from the frozen lockfile; install reported ignored optional native build scripts (`sharp`, `unrs-resolver`) under the managed supply-chain policy.
- Tests: 2 files, 5 tests passed.
- Type checking: passed.
- Lint: passed.
- Production build: passed after allowing Turbopack's local worker process to bind an internal port.
- Repository state before changes: clean; two commits on the current branch.
