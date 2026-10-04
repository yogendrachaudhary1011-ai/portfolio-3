---
name: "frontend-design"
description: >
  Universal frontend design constitution enforcing anti-slop rules, zero-pill metadata discipline,
  2+1 typographic hierarchy, 60-30-10 color allocation, and full viewport presence.
---

# Frontend Design Skill

## 1. Order of Resolution
1. **Function**: Every interactive element has a working handler; no dead clicks.
2. **Legibility & Accessibility**: WCAG AA contrast (4.5:1 body, 3:1 large text), visible `focus-visible` rings, touch targets >= 44px on mobile.
3. **Layout Integrity**: 1440px desktop baseline, clean responsive wrapping, single-line controls (`whitespace-nowrap`).
4. **Spatial & Typographic Math**: Outer container padding >= inner child gap. Nested radius: `r_inner = r_outer - padding`.
5. **Aesthetic Direction**: Domain-native visual language and intentional typography pairings.

## 2. Anti-Slop & Visual Restraint Rules
- **Zero-Pill Metadata**: Render static tags, dates, categories, and read times as clean unboxed text with typographic separators (`·`, `/`). Reserve button/pill styling strictly for interactive filter controls.
- **No Pseudo-Technical Clutter**: No `//` comment prefixes on headings, no fake system status tickers, and no ghost watermark text behind headings.
- **Single-Elevation Depth**: Prefer whitespace and hairline borders (`1px solid`) over cards nested inside cards.
- **2+1 Typography**: Pair 1 expressive display font + 1 legible body font + 1 tabular monospace font (`tabular-nums`) for metrics and numbers.
- **60-30-10 Color System**: 60% neutral canvas, 30% structural surfaces/hairlines, 10% high-contrast focal accent.
