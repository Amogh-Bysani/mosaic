# Mosaic

**Every screen. One shared workspace.**

Mosaic is an AI-directed collaborative meeting canvas built for the OpenAI Build Week **Work & Productivity** track. It replaces one-presenter-at-a-time screen sharing with a spatial workspace where multiple application sources can remain visible, movable, and organized around the decision at hand.

> **Codex built and hardened the application end to end. GPT‑5.6 powers Mosaic Copilot’s optional semantic workspace proposals.** The credential-free deterministic path uses the same review-and-apply interaction, so judges can experience the complete product story without external setup.

## The problem

Important meetings rarely depend on one screen. A quarterly review may require a dashboard, a forecast model, and a strategy deck; an engineering incident may require source code, an application preview, and logs. Traditional screen sharing repeatedly hides the context participants need to compare.

## The solution

Mosaic keeps those sources on one spatial canvas. Participants can arrange a private Personal Canvas, work from a host-published Shared Canvas, and ask Mosaic Copilot to turn a natural-language instruction into a reviewable attention plan. AI never moves the workspace immediately: every proposal can be inspected, applied to an allowed canvas, dismissed, and undone.

## Try the Guided Demo

Open `/demo`. No Zoom or OpenAI credentials are required.

The primary Business Review preset contains three original sample applications:

- **Revenue Performance** — Jordan’s dashboard
- **Q4 Forecast Model** — Maya’s spreadsheet
- **Q3 Review Deck** — Amogh’s presentation

The secondary Engineering Debug preset contains:

- **Code Editor**
- **Application Preview**
- **Service Logs**

Sample content is consistently labeled **GUIDED SAMPLE** or **SAMPLE**. It is never presented as a live share.

### Guided interactions

- Play the one-screen-at-a-time problem introduction and reveal all three sources.
- Drag, resize, bring forward, focus, explicitly restore, minimize, reopen, reset, and undo.
- Switch between Business Review and Engineering Debug.
- Keep independent Personal and Shared canvas layouts.
- Publish a canonical Shared Layout as host, then explicitly Apply Host Layout to Personal Canvas.
- Type a Copilot instruction or run the clearly labeled guided “Hey Mosaic” caption event.
- Review affected sources, proposed actions, focus order, rationale, and decision prompts.
- Apply to Personal Canvas, apply to Shared Canvas as host, or dismiss.

## Mosaic Copilot

Typed Copilot is the primary AI interaction. Useful requests include:

```text
Make the forecast the main view
Compare the forecast against revenue performance
Keep all three visible
Put Maya beside Jordan
Focus the dashboard
Minimize the review deck
Restore the previous layout
Arrange this for a decision
Switch to engineering debug
```

The server accepts only the explicit instruction, active source metadata, normalized geometry, current canvas mode, and whether the user may publish Shared state. Mosaic does **not** send screen pixels, audio, or a full transcript to GPT‑5.6.

### Deterministic fallback

The same endpoint always has a local deterministic result. Missing credentials, request errors, invalid model JSON, unknown source IDs, contradictory focus/minimize actions, out-of-bounds geometry, undersized tiles, or severe overlap all resolve to a safe proposal. The guided demo therefore does not depend on network or API availability.

### Caption trigger

The Guided Demo includes a finalized-caption simulation that enters a bounded state flow and sends only the command following “Hey Mosaic.” It is labeled as guided simulation, not live transcription. Production caption integration remains future work and should include participant notice and consent.

## How Codex was used

Codex served as the primary engineering agent and integrator—not merely as a code-completion tool. Across the repository, Codex:

- audited the existing implementation and mapped product claims to actual behavior;
- preserved the original Next.js architecture while building the spatial React canvas and sample applications;
- implemented normalized geometry, canvas bounds, minimum dimensions, focus/restore, minimize/reopen, reset, z-ordering, and undo history;
- separated Personal Canvas, Shared Canvas, and the host-published canonical layout to prevent accidental Personal Canvas overwrites;
- built the deterministic Copilot intent parser and the human-reviewed proposal workflow;
- integrated the OpenAI Responses API with strict structured output and defensive validation;
- implemented the server-only Zoom Video SDK token route and isolated multi-share verification spike;
- added compact versioned synchronization messages with size, staleness, ID, and host-permission checks;
- expanded automated coverage from 5 tests to 20 tests across geometry, layouts, commands, Copilot, captions, and store transitions;
- ran security/truthfulness audits, lint, TypeScript checking, tests, and production builds;
- wrote the repository, privacy, setup, and submission-readiness documentation.

Primary Codex session ID: **ADD FROM CODEX `/status` OR SUBMISSION FLOW**

## How GPT‑5.6 was used

GPT‑5.6 is the optional semantic orchestration engine behind Mosaic Copilot. Given a meeting instruction and safe tile metadata, it produces a structured attention plan containing:

- a concise layout title and summary;
- rationale for the proposed workspace;
- affected source IDs and bounded actions;
- normalized tile coordinates, dimensions, z-order, priority, and minimized state;
- a recommended focus order;
- optional decision prompts that help move the meeting forward.

GPT‑5.6 does not directly control the canvas. Its response must pass Mosaic’s Zod schema and semantic checks, and the participant must choose **Apply Personal**, **Apply Shared** (host only), or **Dismiss**. A deterministic fallback preserves the full experience when GPT‑5.6 is unavailable.

## Live Zoom behavior

`/dev/zoom-spike` is the isolated live-integration verification route. With Zoom Video SDK credentials it initializes a custom Video SDK session, joins a named topic, requests multiple-share privilege, starts a browser screen share, and attaches incoming share views.

This is a custom Zoom Video SDK application, **not** an extension inside an ordinary Zoom Meeting. The documented MVP target is up to four rendered shares and one published share per participant; Mosaic does not claim unlimited concurrent sharing. The primary canvas currently demonstrates sample sources, while live-media-to-tile integration remains roadmap work.

## Feature truth table

| Capability | Guided Demo | Live path |
| --- | --- | --- |
| Original business and engineering sources | Complete, labeled sample | Not applicable |
| Drag, resize, focus, restore, minimize, reopen, reset, undo | Complete | Canvas integration pending |
| Personal/Shared layout isolation and host publication | Local event model complete | Realtime transport pending |
| Typed Copilot and deterministic fallback | Complete | Complete when route is reachable |
| GPT‑5.6 structured proposals | Optional | Optional with API key |
| “Hey Mosaic” | Guided finalized-caption simulation | Live transcription pending |
| Zoom token generation | Not required | Complete with credentials |
| Real screen sharing | Not claimed | Isolated spike; manual credentialed test required |

## Architecture

```text
Browser
├── Next.js / React spatial canvas
├── Zustand Personal, Shared, and host-published snapshots
├── normalized tile geometry + completed-action history
├── typed / guided-caption Copilot entry
└── isolated Zoom Video SDK share renderer

Next.js server
├── POST /api/arrange
│   ├── validated GPT‑5.6 structured output
│   └── deterministic local proposal fallback
└── POST /api/zoom-token
    └── short-lived server-signed Video SDK JWT

Safety layer
├── Zod input and output schemas
├── ID, action, bounds, minimum-size, and overlap checks
├── explicit Apply / Dismiss
└── Undo
```

## Tech stack

- Next.js 16, React 19, and TypeScript
- Zustand state management
- `react-rnd` spatial interaction
- OpenAI Responses API with strict JSON Schema output
- Zoom Video SDK and `jose`
- Zod validation
- Tailwind CSS 4/PostCSS plus custom CSS
- Vitest and Testing Library

## Local setup

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000/demo](http://localhost:3000/demo). A clean browser session requires no credentials for the Guided Demo.

### Environment variables

```env
# Optional GPT‑5.6 proposals
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6

# Optional Zoom Video SDK verification
ZOOM_VIDEO_SDK_KEY=
ZOOM_VIDEO_SDK_SECRET=
```

All secrets are server-only. Never use `NEXT_PUBLIC_` for these values and never commit `.env.local`.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Current automated suite: **20 tests across 6 files**.

## Browser support

The MVP targets current desktop Chrome and Edge. Browser screen-capture behavior and simultaneous-share support depend on browser and Zoom account capabilities.

## Privacy and security

- OpenAI and Zoom secrets remain server-side.
- API payloads are schema validated and errors are intentionally generic.
- The Zoom token is scoped to the validated session, role, and identity and expires after two hours.
- No screen pixels are sent to GPT‑5.6.
- The caption simulation sends only the explicit post-wake command.
- Personal Canvas state is never replaced by Shared state without the user choosing Apply Host Layout.
- AI proposals require human confirmation and remain undoable.
- Production caption awareness should always display a participant privacy notice.

## Deployment

Deploy as a standard Next.js application over HTTPS. Configure only the optional server-side environment variables above. `/demo` must remain public and credential-free.

- Deployment URL: **ADD PUBLIC URL**
- Demo video: **ADD PUBLIC VIDEO URL**
- Public repository: **ADD PUBLIC REPOSITORY URL**

## Known limitations and roadmap

- Live Zoom media is verified separately from draggable application tiles.
- Shared Canvas publication currently models low-frequency completed actions locally; a production room needs an authenticated realtime transport.
- Live Zoom transcription is not enabled in the Guided Demo.
- Real concurrent-share testing requires Zoom credentials, capture permission, and two clients.
- Rooms are not persisted and do not yet have production identity/access controls.
- A future desktop companion or browser extension could capture multiple sources from one participant more naturally.
- Future visual understanding could be added only with explicit consent, secure image handling, and clear disclosure; it is not part of the current GPT‑5.6 payload.

## Third-party libraries

Mosaic uses OpenAI, Zoom Video SDK, Next.js/React, Zustand, Zod, `react-rnd`, Lucide, Tailwind CSS, Vitest, and their transitive dependencies under their respective licenses.

## License

MIT — see [LICENSE](./LICENSE).
