# LABS DESIGN SYSTEM — STRICT RULES (locked)

Governs `lab.nabarajkc.com.np` only. This is the R&D wing of the brand — it should feel like walking into a real studio/lab, not another marketing page and not the chatbot app. Read this before generating any Lab screen. If a generated design conflicts with this file, regenerate — don't merge.

**Relationship to the rest of the site:** Labs inherits `--color-ink`, `--color-muted`, and the site's one `--color-accent` from the main `design-strict-rules.md` — same brand, same person. It adds its own background tone and a 3D/material layer on top. Never invent new brand colors here.

---

## 1. The core idea: "materials, not magic"

Every visual metaphor in the Lab must reference a real physical material or instrument — glass, lens, prism, frosted acrylic, brushed metal, paper, light through a window — because that's what makes a lab feel real and tactile. It must never reference generic "AI" iconography.

**Banned 3D/visual clichés (the 3D version of the purple-gradient problem):**
- Wireframe rotating globe or network-node sphere
- Floating "neural network" particle mesh
- Generic glowing brain or circuit-board texture
- Rotating torus knot / abstract logo-loop (the default Three.js starter-kit look)
- Holographic "AI assistant" humanoid or floating orb-with-face

**Use instead:** a real glass sphere or lens with actual refraction/blur, a prism splitting light into the accent color, frosted acrylic panels with depth, soft studio-light gradients (not neon), paper/instrument textures for cards.

---

## 2. Color

| Token | Value | Use |
|---|---|---|
| `--color-ink` | inherited from main site | Primary text |
| `--color-muted` | inherited from main site | Secondary text, borders |
| `--color-accent` | inherited from main site | Interactive states, status highlights — same accent, no new hue |
| `--color-lab-canvas` | `#F3F4F2` (cool stone-gray, NOT the ivory `#F5F1E8` from the main site, NOT the cool-blue `#FAFBFE` from the chatbot) | Lab background — signals "different wing" without breaking brand |
| `--color-lab-surface` | `#FFFFFF` | Cards, panels |
| `--color-lab-deep` | `#16171A` | Optional dark section background for a single "instrument" moment per page (see Section 4) — used sparingly, like the dark CTA band on the main site |

Status/tag colors (for experiment maturity, not brand colors — desaturated, small-scale only):
- "Stable" — muted green, low saturation
- "Experimental" — accent color
- "New" — muted amber
Never apply status colors to large surfaces — text/badge only, max 24px height.

---

## 3. Typography

Same type family as the main site (Switzer / General Sans) for headings and body — this is still your brand. Add:

- **Monospace for all technical readouts** (JetBrains Mono): confidence scores, model names, latency numbers, version tags, timestamps. This is the Lab's signature typographic move — numbers and metadata always render in mono, everything else in the brand sans.
- Headline scale can run larger and looser than the marketing site (this is a showcase space) — 64–110px hero headline is acceptable.
- Body copy for experiment descriptions: 16–17px, generous line-height (1.6), never dense paragraph blocks — the Lab explains itself in short, confident lines, not documentation-style prose.

---

## 4. The one dark "instrument" moment

Exactly like the main site allows one full-bleed dark CTA band, the Lab is allowed ONE dark (`--color-lab-deep`) full-bleed section per page — reserved for the single most impressive live demo or the hero itself. Do not create multiple dark sections; the contrast only works because it's rare.

---

## 5. 3D/material treatment — concrete direction

- **Hero anchor:** one real dimensional object — a glass lens or prism rendered with actual light refraction (CSS backdrop-filter + gradients, or a lightweight Three.js/WebGL scene if performance allows) — through which the accent color visibly refracts/splits. This replaces the generic AI orb.
- **Depth via blur, not via drop shadow stacking:** use backdrop-blur and layered translucency (glass-morphism done with restraint and real optical logic — light behind the glass should visibly distort) rather than the flat "0.1-opacity shadow on everything" pattern.
- **Motion:** kinetic type is allowed ONCE — e.g. the hero headline subtly responds to scroll (letter-spacing or weight shift), per current award-winning-site practice — but never on body text or repeated on every section. Everywhere else, motion follows the main site's rule: one fade+rise scroll reveal, 400ms ease-out, no exceptions.
- **Texture:** a very subtle grain/noise overlay (2–3% opacity) on large flat color areas prevents the "flat vector AI slop" look — apply sitewide at low intensity, not per-section.

---

## 6. Layout patterns — do / don't

**Do:**
- Hero: kinetic headline + one real dimensional glass/prism object, NOT centered-and-symmetric — offset, like the main site's hero
- Experiment grid: each card shows a LIVE, looping micro-preview of the actual tool (a tiny canvas animation, a looping GIF-quality capture of real output, or an embedded mini-interactive) — never a static screenshot or icon standing in for the tool
- Each card carries: title, one-line outcome-focused description ("Scores your resume against any job description"), a maturity badge (Stable/Experimental/New), and a category tag (Visualizer / Utility Tool / Nepali AI / Systems)
- A short "Lab Notes" strip — dated, terse research-log entries ("July 2026 — shipped confidence scoring on the transliteration model, accuracy up 6%") — this is what makes it feel like an active lab, not a static showcase
- Filtering by category tag, not a generic search-only pattern

**Don't:**
- Don't tile all experiments as identical square icon-cards (that's the SaaS-feature-grid problem again, just with cooler cards)
- Don't use a loading skeleton that's just gray boxes everywhere — use a lab-appropriate loading state (e.g. a thin scanning-line animation, tying back to the "instrument" metaphor)
- Don't let every card have the exact same live-preview treatment — vary preview type by category (a visualizer card shows its canvas; a utility-tool card shows a sample input/output pair cycling)
- Don't add a chatbot-style greeting orb here — that visual language belongs to the chatbot subdomain only, keep the two visually distinct despite sharing brand tokens

---

## 7. Before shipping any Lab page — checklist

- [ ] Background uses `--color-lab-canvas` (#F3F4F2), not the site's ivory or the chatbot's cool-white
- [ ] Zero generic "AI" 3D iconography (no wireframe globes, no particle networks, no neural-net meshes)
- [ ] One dimensional glass/prism/material object as the hero anchor, with real optical refraction of the accent color
- [ ] All numeric/technical readouts in monospace
- [ ] At most one dark full-bleed section on the page
- [ ] Every experiment card shows a live/looping preview, not a static screenshot
- [ ] Motion: one kinetic-type moment max, everything else uses the standard scroll-reveal
- [ ] Gut check: does this look like a real research lab's internal tool page, or does it look like an "AI startup landing page template"? If the latter, redo it.
