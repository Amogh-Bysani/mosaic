# Mosaic MVP audit

## Functional
- Guided demo has no credential dependency.
- All sample sources are labeled SAMPLE; live route is separate.
- AI suggestions require human confirmation and can be undone.
- Layout output rejects missing, duplicate, unknown, or out-of-bounds tiles.
- Zoom credentials are used only by the server JWT route.

## Demo truthfulness
- Do not claim ordinary Zoom Meeting compatibility.
- Do not claim screen-content understanding; current GPT input is metadata and explicit instructions.
- Do not describe the caption simulation as live transcription.
- Do not call sample tiles live.
- Describe the four-share target rather than unlimited shares.

## Manual live checks
- [ ] Two clients join the same Video SDK session.
- [ ] Each publishes one screen.
- [ ] Both render the other share.
- [ ] Stop-share detaches cleanly.
- [ ] Browser permission denial displays an error.
- [ ] GPT response works with configured key.
- [ ] GPT failure returns deterministic proposal.

## Submission readiness
- [ ] Replace README URL placeholders.
- [ ] Record a narrated video under 3 minutes.
- [ ] Show live Zoom proof separately from guided sample scenario.
- [ ] Include specific Codex and GPT contribution language.
- [ ] Add primary Codex session ID.


