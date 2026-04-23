# Working agreements for this project

## Visual verification
- Do not use Playwright, Puppeteer, Chromium automation, or any headless-browser screenshot tools. Ever.
- Do not write Python scripts to screenshot the running app.
- Do not attempt to visually verify your work by rendering it programmatically.
- When visual verification is needed, ask the human to look at the browser and describe what they see.

## Self-review
- Do not run extended self-review loops or walk through checklists on your own.
- When a task is complete, report what changed in plain text — short summary, two to four sentences per changed area.
- Wait for human feedback before iterating further.

## Roles
- The human is the visual reviewer and product owner.
- Claude Code is the builder.
- These roles do not overlap.

## Verification methods allowed
- Reading source files you wrote to confirm the code is structured correctly.
- Running type-checks or lint commands that report errors in plain text.
- Running the dev server and confirming it starts without errors.
- Asking the human clarifying questions when unsure.

## Spec as source of truth
- IMVI_WEB_PORTAL_POC_SPEC.md is the living source of truth for design, architecture, and scope decisions.
- When a decision is made during a session, update the spec as part of the same task.
- Add a dated changelog entry at the top and increment the version number.
- Edit the relevant section(s) so the spec matches reality. Remove contradictory older copy.
- The spec must never drift from what is actually built.

## Brand inheritance
- The mobile spec (IMVI_MOBILE_POC_SPEC.md) is the source of truth for the brand system.
- When in doubt on a visual decision, reference the mobile spec and the moodboard rather than improvising.
- Web-specific additions are documented in the web spec; do not duplicate mobile content.

## External asset downloads
- Use canonical source URLs. Google Fonts binaries via the `fonts.gstatic.com` CSS endpoint, not guessed GitHub-raw permalinks. OpenClipart SVGs via the detail-page HTML's timestamped URL (e.g. `/download/307722/1538858581.svg`), not a guessed `/download/{id}/{slug}.svg`.
- After downloading, verify the file is nonzero before using it (`ls -la`, or check size in the tool output).
- If a download 404s or returns 0 bytes, stop. Ask the user or find the canonical URL — do not substitute a guess. Silently falling back to a different asset or a synthesized placeholder is worse than stopping.
- This rule exists because early in Session 1 we wasted time on guessed permalinks that returned empty bodies; the canonical paths (CSS-endpoint fonts, detail-page-parsed SVGs) work reliably.

## Completion discipline
- When the user lists multiple items in a single request, address each one explicitly. Do not skip items silently.
- When reporting a task done, enumerate what was done item by item. "Done." is not a completion report when three things were asked for.
- If one of the items was skipped or deferred, say so and say why in the same report — don't let the user discover it later.
- This rule exists because mid-session the user twice had to call out items that had been dropped without acknowledgement ("Stop. Two items from the last round were not completed." / "Stop. Two things … got lost along the way.").

## Design generation principles
- **Styling variation over compositional variation.** When the brief calls for "variations," vary styling (fonts, color application within the palette, textures, effects, decorative elements) within a locked compositional frame. Don't rearrange element positions, hierarchy, or card proportions. The locked layout IS the brand-consistency mechanism.
- **Card font library is separate from web chrome.** Card compositions can and should use a wide pool of character fonts (Bangers, Bungee, Shrikhand, Permanent Marker, Bowlby One, etc.) sourced from Google Fonts. The web chrome still follows the two-font rule (Oswald + Inter) — do not conflate the two pools.
- **Anchor to references, not defaults.** When designing backgrounds / textures / card styling, anchor to the reference cards (Will Fountain, Leigha, Bryce, Harlan, Arthur, Levi) rather than improvising from generic "trading card" defaults. If no reference exists for a given surface, ask before improvising.

## Placement discipline
- No card element (chevron, logo, number, name lockup, IMVI wordmark) may touch or cross the white frame border.
- Maintain ~30px of clearance from the frame inset on every side. In code this is encoded as `SAFE_PAD = 32` added on top of the frame's own inset.
- If a placement conflicts with another element (e.g. a chevron colliding with an enlarged logo), move the chevron first — don't shrink the logo. Layout decisions have hierarchy: subject > logo > number > name lockup > chevrons > wordmark. Lower-priority elements move out of the way of higher-priority ones.
