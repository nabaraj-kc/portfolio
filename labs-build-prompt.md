# Antigravity Build Prompt — Labs Homepage (`lab.nabarajkc.com.np`)

Paste directly into Antigravity. Read `labs-design-strict-rules.md` in this same project first — every color, type, motion, and layout decision below must comply with it. Do not improvise a new visual direction.

---

## Intent

This is the R&D wing of the site — it must feel like walking into a real, active research lab or design studio, not another AI-startup landing page. Confident, dimensional, quiet color, materials-based 3D (glass/prism/lens), zero generic "AI" iconography. Every experiment shown must be provably live, not a static description.

## Homepage structure

### 1. Nav
Same nav shell/tokens as the main site, but with a "Lab" wordmark lockup (e.g. your logo + "/lab" suffix, small, monospace) so it reads as a distinct wing of the same brand, not a different product.

### 2. Hero
- Kinetic headline (one-time scroll-linked effect only, per strict rules) — something like "Experiments in {your name}'s Lab" or a first-person line about what this space is for
- One real dimensional object as the visual anchor: a glass lens/prism rendering with the site's accent color visibly refracting through it — built with CSS backdrop-filter/gradient layering, or a lightweight performant WebGL scene if you want true depth. This is the ONLY 3D hero object on the page — do not scatter multiple 3D elements around it.
- One-line subhead beneath: what kind of experiments live here (model internals, Nepali-language AI, practical tools) — no generic "innovative AI solutions" copy

### 3. Lab Notes strip
- A horizontal or compact list of 3–5 short, dated research-log entries (see format in strict rules) directly under the hero — this is what signals "actively maintained," not "finished once."

### 4. Experiment grid (the core of the page)
- Filterable by category tag: Visualizer / Utility Tool / Nepali AI / Systems
- Each card MUST show a live or looping preview of the real tool, not a screenshot or icon. Build this as:
  - Visualizer-type tools → a small live canvas rendering actual output (e.g. a miniature attention-weight animation)
  - Utility tools (resume analyzer, code reviewer) → a looping before/after or input→output pair cycling every few seconds
  - Nepali AI tools → live sample of the actual model output looping (e.g. handwriting stroke → recognized character)
- Card contents: live preview, title, one-line outcome-focused description, maturity badge (Stable/Experimental/New — small, muted, monospace), category tag, "Try it →" link
- Grid should NOT be uniform equal-size squares — vary at least two card sizes (one larger "featured" experiment, rest standard) to avoid the generic feature-grid look

### 5. One dark "instrument" section (optional but recommended)
- A single full-bleed dark (`--color-lab-deep`) section featuring your single most impressive experiment as a larger embedded live demo, not just a card — e.g. the Roman-to-Nepali model with visible confidence scores, or the attention visualizer
- This is the loudest visual moment on the page — everything else stays quiet so this lands, exactly like the dark CTA band on the main site

### 6. Closing
- Short CTA back to main site contact, or "Suggest an experiment" mailto/form link — keeps the Lab feeling like an open, evolving space rather than a closed showcase

## Flagship experiments to build (launch set)

Build these five first, each using the appropriate template from `labs-feature-templates.md`:
1. **Resume/CV Analyzer** — utility-tool template
2. **AI Code Reviewer** — utility-tool template
3. **Nepali Document/Tax Q&A** — RAG/QA template
4. **LLM Cost & Token Comparator** — utility-tool template (lighter weight, mostly client-side)
5. **Attention-Head Visualizer** — visualizer template (client-side, no backend needed)

## Technical constraints
- Server-render the homepage shell and card metadata for SEO; live previews can be client-side canvas/WebGL
- Componentize: `LabNav`, `LabHero`, `LabNotesStrip`, `ExperimentCard` (with a `previewType` prop switching between canvas/looping-pair/video), `FeaturedInstrumentSection`
- Each experiment card links to its own page built per `labs-feature-templates.md` — do not let Antigravity freestyle each tool's page individually, that's exactly how vague/inconsistent UI creeps back in
- Real content only: no placeholder Lorem Ipsum descriptions, no fake maturity badges — if a tool isn't built yet, don't list it
