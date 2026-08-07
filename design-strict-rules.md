# DESIGN SYSTEM — STRICT RULES (locked)

This file is the single source of truth for every page, subdomain, and component across nabarajkc.com.np. Antigravity (or any contributor, human or AI) must read this before generating UI. If a generated design conflicts with this file, the file wins — regenerate, don't merge.

---

## 1. Color — exactly these tokens, nothing else

| Token | Hex | Use |
|---|---|---|
| `--color-ink` | `#202020` | Primary text, dark CTA band background, footer background |
| `--color-muted` | `#8F8F8F` | Secondary text, hairlines, disabled states, tags |
| `--color-paper` | `#F5F1E8` | Primary page background (default — not white) |
| `--color-surface` | `#FFFFFF` | Cards, elevated surfaces, inputs |
| `--color-accent` | *(pick one, see below)* | Links, active states, focus rings — used sparingly, never as a background fill for large areas |

**Accent color rule:** choose exactly ONE accent for interactive states only (hover, active, focus, links, tags). Do not use purple, indigo, or violet — that combination is the single most recognizable "AI-generated site" signature and is banned outright. Acceptable directions: a warm amber/ochre (fits the ivory palette), a deep forest or teal green, or a muted brick red. Pick one, put it in the token above, and never introduce a second accent.

**Banned:** gradients of any kind in hero sections or backgrounds. Gradients are allowed only as a 2–4% opacity overlay on a photo for text-legibility, never as a decorative background element.

---

## 2. Typography

**Display/heading typeface:** the reference design uses Aeonik, a commercial license (Cotype Foundry) — do not pirate the font. Use one of these free, license-clear near-equivalents instead:
- **Switzer** (Fontshare, free) — closest structural match to Aeonik
- **General Sans** (Fontshare, free) — slightly warmer alternative
- If budget allows later, license Aeonik properly and swap the token — the system is built to make that a one-line change

**Body typeface:** same family as display, used at a lighter weight — do not switch families between heading and body on this design (unlike the "editorial serif + sans" pairing recommended for the darker technical variant discussed earlier in this project — this warm/ivory direction uses ONE typeface family throughout, per the reference).

**Monospace (your addition, not in the reference — use for tech-signal moments only):** JetBrains Mono, for: code snippets, dates in the timeline, tags, stat labels, footer metadata. This is what marks the site as an engineer's, not a designer's, portfolio — use it deliberately and sparingly.

**Scale — enforce large jumps, ban the "safe middle":**
| Level | Size (desktop) | Weight |
|---|---|---|
| Hero headline | 96–140px | 500–600 |
| Section heading | 40–56px | 500 |
| Card/subhead | 20–24px | 500 |
| Body | 16–18px | 400 |
| Small/meta (tags, dates) | 12–13px, monospace | 500, uppercase, letter-spacing +0.04em |

Never use a single weight across a page. Never set headline and body in the same size family with less than a 4x size ratio.

---

## 3. Spacing, radius, elevation

- Base spacing unit: 8px. All padding/margin values must be multiples of 8 (or 4 for tight/small components only).
- Section vertical padding: minimum 96px top/bottom on desktop, 64px on mobile. Do not compress sections to fit more "above the fold" — whitespace is the design.
- Card/image radius: 12px standard, 24px for large hero/feature images. Do not mix more than two radius values on one page.
- Shadows: maximum `0 8px 24px rgba(32,32,32,0.06)`. Never use the default Tailwind `shadow-lg`/`shadow-xl` at full opacity — it reads as generic-template immediately.
- Hairlines/dividers: 1px, `--color-muted` at 20% opacity. Never a full-opacity border.

---

## 4. Imagery

- All hero, about, and case-study imagery must be real photography (yours) or real product/project screenshots. No AI-generated "tech" imagery: no glowing brains, no circuit-board textures, no abstract robot hands, no floating holographic UI panels.
- If a placeholder is unavoidable during build, it must be flagged in code with `{/* PLACEHOLDER: replace with real photo */}` — never shipped as a generic stock image.
- Photography treatment: natural light, warm tone, slight desaturation is fine; no heavy duotone, no purple/blue color-grade overlays.

---

## 5. Motion

- One scroll-reveal pattern for the entire site: fade-in + 12px upward translate, 400ms, ease-out, triggered once per element (no re-animating on scroll-up).
- One hover pattern for cards/images: 1.02x scale OR a 2px upward translate — pick one, use everywhere, don't mix.
- No parallax on text. No auto-playing carousels. No cursor-follow blobs/gradients.
- Page-load: at most one coordinated entrance animation (e.g. headline + portrait staggered by 100ms). Everything else appears on scroll, not on load.

---

## 6. Layout patterns — explicit do/don't

**Do:**
- Asymmetric hero (headline + offset portrait/image), not centered-everything
- Timeline/list pattern for experience or process content (year, thumbnail, title, tag in a row)
- One full-bleed high-contrast band per page maximum, used for the single most important CTA
- Masonry or unequal-height grid for project/work thumbnails
- Real stat callouts (a specific number you can defend) styled as large numerals, not icon+text feature blurbs

**Don't (the AI-slop checklist — ban these outright):**
- Purple-to-blue gradient hero backgrounds
- Three or four identical cards in a row with an icon, a bold title, and one sentence of vague copy ("Innovative solutions for modern problems")
- Inter as the only typeface with no display face
- Glassmorphism/frosted-glass panels used decoratively rather than functionally
- Generic "trusted by" logo strips with no real logos
- Emoji used as section icons
- 0.1-opacity drop shadows on every card by default
- Centered, symmetric hero with a stock illustration of a person at a laptop
- Any AI-generated headshot, hand, or "team" illustration

---

## 7. Consistency rule across subdomains

Every subdomain (`blog`, `admin`, `api` docs, `lab`, `status`, `cv`) must import the same color/type/spacing tokens from this file. `admin.` and `api.` docs may use denser spacing (this is a tool, not a brand moment) but must never introduce new colors, a new typeface, or Tailwind's default shadow/radius scale. One brand, one system, every surface.

---

## 8. Before shipping any new page — checklist

- [ ] Uses only the 5 color tokens above, one accent max
- [ ] Uses only the two approved typefaces (display/body + mono for tech accents)
- [ ] No gradient backgrounds, no purple/indigo anywhere
- [ ] At least one real photo or real screenshot, zero stock/AI imagery
- [ ] Spacing on the 8px scale, section padding ≥96px desktop
- [ ] Only one high-contrast (dark band) moment on the page
- [ ] Motion matches the one approved scroll-reveal + one approved hover pattern
- [ ] Passes the "does this look like a template" gut check — if it looks like it could be any SaaS company's homepage with the logo swapped, it fails
