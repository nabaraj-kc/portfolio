# RESUME ANALYZER — STRICT DESIGN RULES

Extends Template B (Utility Tool) from `labs-feature-templates.md`. This file locks the exact structure for this one tool. It is based on a strong reference UI (Mockai) for information architecture ONLY — the color skin, gradients, and iconography of that reference are explicitly NOT used here, for the reasons below.

## Why we're not cloning the reference skin directly

The reference uses a violet/purple accent, gradient buttons, a dark rounded promo card, and a rainbow gradient "AI" orb icon. That exact combination is the most common visual signature of template-generated AI SaaS products in 2026 — it's the thing this whole project has been built to avoid. We keep the reference's information architecture (it's genuinely well structured) and rebuild the skin entirely in the Lab's own token system, so it reads as your product, not a reskinned template.

---

## Layout — two states

### State 1: Upload (modal or dedicated panel, not a full-screen takeover)
- Centered card, max-width 480px, background `--color-lab-surface` (#FFFFFF) with a soft glass treatment: subtle `backdrop-filter: blur()` and 1px border in `--color-muted` at 15% opacity — same glass language as the chatbot's input card, NOT the reference's mint-green tinted box
- Heading: "Upload your resume", 24px, weight 600, `--color-ink`
- One-line explainer beneath, 14px, `--color-muted`, stating exactly what's analyzed and file constraints (format, size) — real info, no filler
- Dropzone: dashed 1.5px border in `--color-muted` at 30%, radius 12px, background `--color-lab-canvas` at 50% opacity (not mint green) — on file selected, border and icon switch to `--color-accent` (your one brand accent), with a simple checkmark icon, filename shown in monospace
- "What we'll analyze" — two-line plain list beneath the dropzone, icons in `--color-accent`, not a boxed sub-panel
- One full-width primary button, `--color-ink` background (NOT a purple gradient), white text, radius 10px, height 48px — matches every other primary button across the whole site/lab, no one-off gradient treatment for this tool

### State 2: Results (the main tool page, using Template B's two-panel structure)

**Left/primary panel — Score hero:**
- Large circular progress ring, single-color stroke in `--color-accent` (not purple), track in `--color-muted` at 15% opacity
- Center: big numeral in monospace, 56px, weight 700, `--color-ink`, with "ATS Score" label beneath in 13px `--color-muted`, uppercase, letter-spacing 0.04em
- Below the ring: filename + one-line status ("Resume.pdf — analysis complete"), 15px
- Two actions beneath, side by side, outlined buttons (not filled): "Download Report" and "Analyze Another" — icon + label, 14px, `--color-lab-surface` background, 1px border

**Right panel — structured findings (stacked cards, consistent card style: white surface, 1px border, radius 12px, 20px padding, no drop shadow beyond the standard whisper-shadow token):**

1. **Keyword Match card** — label, one-line description, inline percentage in monospace, thin horizontal progress bar in `--color-accent`
2. **Formatting Feedback card** — checklist rows, each row: status icon (check in a muted green circle for pass, dot/exclamation in muted amber for a suggestion — small, 20px, never a large colored background block like the reference) + finding text, 15px. Rows separated by hairline, not colored background bands.
3. **Skills comparison** — two-column layout: "Extracted Skills" (pills in `--color-lab-canvas` background, `--color-ink` text, 1px border) vs. "Consider Adding" (pills outlined in `--color-accent` at low opacity, `--color-accent` text, small "+" prefix) — same pattern as the reference, different palette
4. **Quick Tips** — short bulleted list, plain text, no card chrome needed if space-constrained

## Explicit don'ts for this tool
- No purple/violet anywhere — use the site's single accent token only
- No gradient buttons or gradient icons (the reference's "Ai" orb style is banned — if this tool needs an icon, use a simple line icon in `--color-accent`, not a rainbow gradient orb)
- No colored background bands behind checklist rows (mint-green/amber-tinted rows) — status communicated by a small icon only, keep row backgrounds neutral
- No dark rounded "upgrade" promo card — this is a free lab tool, no upsell chrome
- Score ring and numeral must use monospace for the number, matching every other technical readout in the Lab (per `labs-design-strict-rules.md` Section 3)

## Honest limitation line (required per the shared header spec in labs-feature-templates.md)
State plainly on the page: ATS scoring is an estimate based on common applicant-tracking-system patterns, not a guarantee of how any specific company's ATS will parse the resume.
