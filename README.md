# Mosaic

**Every screen. One shared workspace.**

Mosaic is an AI-directed collaborative meeting canvas that replaces one-presenter-at-a-time screen sharing with multiple concurrent workspaces. Participants can spatially arrange sources, keep a private Personal Canvas, publish a Shared Canvas, and ask Mosaic Copilot to turn meeting intent into reviewable layout suggestions.

Built for the OpenAI Build Week **Work & Productivity** track.

## What works

- Polished credential-free guided demo at `/demo`
- Original business-review sources: Revenue Performance, Q4 Forecast Model, and Q3 Review Deck
- Engineering-debug preset
- Drag, resize, bring forward, focus, minimize, restore, and undo
- Personal and Shared Canvas modes
- Scripted one-screen-at-a-time problem intro
- Typed Mosaic Copilot instructions
- “Hey Mosaic” finalized-caption simulation through the same proposal pipeline
- Human approval: Apply or Dismiss before any AI layout changes
- Structured GPT workspace proposals with rationale, focus order, and decision prompts
- Deterministic fallback when OpenAI is unavailable
- Server-generated Zoom Video SDK JWTs
- Isolated Zoom multi-share verification route at `/dev/zoom-spike`
- Layout validation and automated tests

## Product boundary

The guided demo uses clearly labeled original sample interfaces. The Zoom spike is the live integration path and never labels sample sources as live. Mosaic sends only typed/captured instructions and tile metadata to GPT—not screen pixels or video. Caption listening is designed around finalized caption text, not a custom always-on audio pipeline.

## Architecture

```text
Browser
+-- spatial React canvas + normalized tile geometry
+-- Personal Canvas (local state)
+-- Shared Canvas (low-frequency event model)
+-- caption wake-phrase / typed command entry
+-- Zoom Video SDK media elements

Next.js server
+-- POST /api/zoom-token (short-lived Video SDK JWT)
+-- POST /api/arrange (validated structured GPT output)

Reliability layer
+-- deterministic scenario layouts + strict validation + undo
```

## Local setup

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000/demo`. No credentials are required for the guided demo.

For live features, set:

```env
ZOOM_VIDEO_SDK_KEY=
ZOOM_VIDEO_SDK_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6
```

Secrets are server-only. Never prefix them with `NEXT_PUBLIC_`.

## Live Zoom test

1. Open `/dev/zoom-spike` in current Chrome or Edge.
2. Open it again on a second device/browser profile.
3. Join from both clients.
4. Start a screen share from each client.
5. Confirm both incoming share views render independently.

The MVP targets up to four rendered shares and one published share per participant. It is a custom Video SDK session, not an extension inside an ordinary Zoom Meeting.

## GPT-5.6 integration

`/api/arrange` accepts a meeting instruction plus source labels, owners, types, and current geometry. GPT returns a structured attention plan: layout title, rationale, focus order, decision prompts, and bounded coordinates. The server validates IDs, uniqueness, bounds, dimensions, and schema. Any failure returns a deterministic layout, so judging never depends on network/API availability.

## Codex development workflow

Codex served as the primary developer and integrator: it locked demo-first scope, scaffolded the repository, created the spatial canvas and original sample applications, implemented the Zoom token and multi-share spike, built the structured Copilot route and fallback validator, added tests, audited security/truthful claims, and prepared deployment and hackathon documentation.

Codex session ID: **ADD FROM CODEX `/status` OR SUBMISSION FLOW**

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Known limitations / roadmap

- Guided caption events are simulated until live Zoom transcription is enabled for the account.
- Shared Canvas transport is architected as low-frequency final-state events; production would use a dedicated realtime service.
- The MVP supports current Chrome and Edge.
- Future work: transcript-aware suggestions, secure visual understanding, persistent rooms, richer access controls, and native desktop/browser-extension capture of multiple sources from one participant.

## Privacy and safety

- SDK and OpenAI secrets remain server-side.
- API payloads are schema validated.
- No screen pixels are sent to GPT.
- AI suggestions require Apply/Dismiss confirmation and support Undo.
- Live captions should be accompanied by an in-product participant notice.

## Hackathon checklist

- [x] Work & Productivity project
- [x] Working credential-free judging path
- [x] Meaningful Codex implementation
- [x] Meaningful GPT-5.6 product integration with fallback
- [x] Repository setup and testing instructions
- [x] Truthful live/sample labels
- [ ] Public deployment URL
- [ ] Public repository URL
- [ ] Public YouTube demo under three minutes with narration
- [ ] Codex session ID
- [ ] Final Devpost text and submission

## License

MIT — see `LICENSE`.


