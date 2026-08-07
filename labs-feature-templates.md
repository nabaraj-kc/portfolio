# LABS FEATURE PAGE TEMPLATES — STRICT RULES

Every tool page under `lab.nabarajkc.com.np/[tool]` must use ONE of the three templates below. Do not design a new one-off layout per tool — that's how "vague AI UI" creeps back in one tool at a time. All three inherit colors/type/motion from `labs-design-strict-rules.md`.

---

## Shared header (all templates)

Every tool page opens with the same header block, regardless of template:
- Category tag + maturity badge (top, small, monospace)
- Tool title (large, brand typeface)
- One-line outcome statement — what it does, in plain language, not a feature list
- "How it works" — a collapsed-by-default 2–3 line technical note (architecture, model used, data source) with a toggle to expand — keeps the page clean for casual visitors but gives real depth for technical ones
- Honest limitations line — one sentence on what this tool doesn't do or where it can be wrong. Non-negotiable: every tool states a limitation. This is a credibility signal, not a weakness.

---

## Template A — Visualizer

For tools where the point is watching something happen: attention-head visualizer, embedding explorer, tokenizer playground, RAG-transparency demo.

**Layout:**
- Left or top: input control panel (text input, sliders, model/dataset picker) — compact, max 30% of width on desktop
- Right or main: large live canvas/visualization area, minimum 60% of viewport height
- Below: a small monospace readout strip showing raw values (attention weights, token counts, embedding coordinates) for anyone who wants the numbers, not just the picture
- No card/box chrome around the visualization itself — let it breathe against the lab canvas background
- Interaction state must update the visualization in real time (no "submit" button delay if avoidable) — the whole point is immediacy

**Don't:** don't wrap the visualization in a heavy bordered "widget" box that makes it look like a dashboard chart — it should feel like an instrument readout, full-bleed within its section.

---

## Template B — Utility Tool (input → output)

For tools that take a real input and produce a real, useful output: resume analyzer, code reviewer, cost/token comparator, accessibility auditor.

**Layout:**
- Two-panel side-by-side on desktop (stacked on mobile): left = input (text area, file upload, or URL field), right = structured output
- Output must be STRUCTURED, never a raw wall of AI-generated prose: use labeled sections, a score/metric at the top if applicable (large monospace numeral + label), a short list of specific findings below, each finding tagged by severity/category
- A persistent "Run again" / "Try another" affordance, not a page reload
- Loading state: the lab's scanning-line motif (per strict rules), not a generic spinner
- If the tool has example inputs, offer 2–3 real one-click samples so a first-time visitor can see output before typing anything themselves

**Don't:** don't return output as an unstructured chat-style paragraph — that undersells a tool that's supposed to demonstrate structured engineering, not just prompting.

---

## Template C — RAG / Q&A

For tools grounded in a document/knowledge source: Nepali tax/legal Q&A, "explain this repo," any retrieval-backed assistant.

**Layout:**
- Chat-style input at bottom (reuse the chatbot input-card component from the chatbot UI system for consistency), but the response area is NOT a plain chat bubble — it must visibly separate into: (1) direct answer, (2) source citation(s) with a link/snippet back to the actual retrieved text, (3) confidence/coverage note ("based on 3 matching sections")
- This visible retrieval step is the entire point of this template — never collapse it into a single opaque answer block, or the tool loses its credibility advantage
- A visible, browsable index of what's actually in the knowledge base (e.g. "grounded in: Income Tax Act 2058, updated July 2026") so visitors trust the scope

**Don't:** don't let this template visually collapse into the general chatbot UI — the citation/source panel must always be visible, not hidden behind a "sources" toggle that visitors won't click.

---

## Choosing a template for a new experiment

| If the tool... | Use |
|---|---|
| Shows model internals / lets you watch something compute | Template A — Visualizer |
| Takes an input and gives a scored/structured verdict | Template B — Utility Tool |
| Answers questions grounded in a specific document/dataset | Template C — RAG / Q&A |

If a new experiment doesn't fit any of the three, that's a signal to extend this file with a new named template (documented, with its own do/don't list) — not to freestyle a one-off page.
