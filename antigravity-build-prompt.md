# Antigravity Build Prompt — nabarajkc.com.np Home / About

Paste this directly into Antigravity as the build brief for the homepage and About section.

---

## Reference and intent

Build in the visual language of a clean, warm, editorial personal-portfolio layout — think restrained ivory/white/dark palette, one large expressive headline moment, real photography, a timeline instead of a feature-card grid, and a single full-bleed dark CTA band as the only high-contrast break in an otherwise quiet page.

**This is NOT a SaaS landing page and NOT a dark "tech" theme.** It is warm, minimal, editorial, and confident. Follow `design-strict-rules.md` in this same project for the locked color/type/spacing system — do not deviate from it, do not invent a new palette, do not add gradients.

## Section-by-section spec

### 1. Nav (sticky, transparent-to-solid on scroll)
- Left: wordmark/logo (your name or initials mark, not a generic icon)
- Center or left-adjacent: 4–5 text links max (Work, Writing, Lab, About, Contact)
- Right: one filled pill button, dark background, white text — "Let's talk" or "Get in touch"
- No hamburger on desktop. Mobile: simple slide-down, not a full-screen takeover with giant type.

### 2. Hero
- Small eyebrow label above headline (e.g. "AI / Software Engineer — Kathmandu")
- One large headline using your name or a short first-person statement, set at extreme size (see type scale in strict rules) — lowercase or sentence case, not all-caps
- A real portrait photo (yours), placed asymmetrically — overlapping or offset against the headline block, not centered in a generic circle avatar
- No gradient background, no particle/mesh background, no stock "AI" imagery (circuit boards, glowing neural nets, robot hands) anywhere on this page
- One small supporting CTA link beneath the fold line: "See what I'm building →"

### 3. About
- Short heading ("About") + 3–4 sentence bio paragraph in your own voice, first person, specific (not "passionate about technology")
- Directly beside or below it: one stat/proof card — pick a real number (years of experience, projects shipped, articles published, a specific metric from a project) styled as a large numeral with a one-line label underneath, on an ivory/white card with generous padding, no drop shadow beyond a whisper (max 4% opacity)
- Pair the stat card with one piece of real supporting imagery: a photo of you working, a screenshot of a real system you built, or an abstract close-up (keyboard, monitor, whiteboard) — not stock photography

### 4. Timeline — "How I got here" (replaces the reference's "Design Journey")
- A vertical list, not a card grid: each row = year range, small thumbnail (company logo or project screenshot), role/title, one-line description, and a small tag (e.g. "Backend", "ML", "Freelance")
- Rows separated by a thin 1px hairline in Gray at low opacity, generous vertical padding between rows (this spacing IS the design — don't compress it)

### 5. Full-bleed dark CTA band
- One section only, full width, Dark (#202020) background, Ivory or White text
- Large statement + one action, e.g. "Open to select consulting work" + a pill button in Ivory with Dark text (inverted from the rest of the site)
- This is the single loudest moment on the page — everything else stays quiet so this lands

### 6. Work grid — "Latest Work" (replaces the reference's portfolio masonry)
- Masonry or asymmetric grid of real project case studies, each tile: project image/screenshot, title, one-line outcome (e.g. "Cut inference latency 40%"), tag
- Rounded corners (use the radius scale in strict rules), no heavy shadows, hover state = subtle image scale (1.02x) + tag reveal, nothing flashier

### 7. Writing — "Insights & Notes" (replaces the reference's blog teaser row)
- 3-card horizontal row of latest articles: cover image (or generated OG-style graphic, not stock), title, read time, date
- Below the row: one small link "Read all articles →"

### 8. Closing CTA / footer
- Large statement in the headline typeface: "Have a project in mind?" or similar, your own line
- Plain email address as a mailto link, styled large and underlined on hover — not hidden in a tiny footer link
- Social icons row (GitHub, LinkedIn, X) — outline style, monochrome, no colored brand icons
- Small footer legal row beneath: copyright, sitemap link, RSS link

## Technical constraints for Antigravity
- Next.js App Router, TypeScript, Tailwind, all colors/type as CSS variables per `design-strict-rules.md` — never hardcode hex values in components
- Server-render all content (no client-only rendering of primary text/images) — required for SEO/AI-crawler visibility
- Real `<img>`/`next/image` with proper alt text on every image — no CSS background-image for meaningful content
- One coordinated scroll-reveal animation style used consistently (fade + 12px rise, 400ms, ease-out) — do not add a different animation per section
- Typography and color tokens must be pulled from the design system file, not redefined per component
- Every image on this page must be real (your own photos/screenshots) or explicitly marked as a placeholder to replace — never AI-generated stock-style "tech" imagery
