# Design System: Qayra

## 1. Visual Theme & Atmosphere
A restrained, gallery-airy interface dedicated to deep focus and contemplation. It balances confident asymmetric grid usage with fluid spring-physics interactions. The atmosphere is quiet, intentional, and editorial — like a premium architectural magazine or a high-end Islamic museum catalog. Knowledge is front and center.

## 2. Color Palette & Roles
- **Canvas Sand** (`#FAF9F6`) — Primary background surface, soft and easy on the eyes for reading.
- **Pure Surface** (`#FFFFFF`) — Modals, dropdowns, and elevated card structures.
- **Ink Charcoal** (`#18181B`) — Primary typography. Zinc-950 depth ensuring stark clarity without the harshness of pure black.
- **Muted Obsidian** (`#52525B`) — Secondary text for metadata, dates, and non-active icons.
- **Whisper Border** (`rgba(226, 232, 240, 0.6)`) — Soft structural dividers and 1px bounding boxes without heavy contrast.
- **Forest Gold** (`#D97706` / Amber 600) — Single subtle accent for highlights, focus rings, and primary interactive states. (No bright neon colors, no purples).

## 3. Typography Rules
- **Display:** `Outfit` — Used for main Headers/Hero text. Track-tight. Clean, modern, yet warm geometry.
- **Body:** `Outfit` — Relaxed leading (`1.6`), maximum 65 characters per line for ideal reading ergonomics. Ink Charcoal color.
- **Mono:** `JetBrains Mono` — Used for verse keys (`@2:153`) and precise reference nodes.
- **Banned:** `Inter`, `Times New Roman`, `Arial`. No loud serif fonts unless used specifically for Arabic verse citations.

## 4. Component Stylings
- **Buttons:** Flat, tactile geometry. `-1px` translate offset on active push. No generic glowing shadows. Dark fill with sand text for primary; transparent with subtle border for secondary.
- **Cards:** No generic dropshadows. Rely on subtle boundaries (`ring-1 ring-stone-200`) and soft, expansive padding (min `2rem` inner).
- **Inputs:** Clean, singular underlines or flat surfaces with subtle inner borders. `Focus-visible` generates a 2px offset ring in Forest Gold.
- **Loaders:** Soft opacity pulses matching the block dimensions rather than standard spinning circles.

## 5. Layout Principles
- **Asymmetric Grid over Blocks:** Avoid predictable 3-column rows. Break the grid with varied widths and generous negative space.
- **Vertical Breathing Room:** Generous paddings `py-24` desktop / `py-16` mobile.
- **No Overlapping Clutter:** Every block of knowledge, UI element, and text sits within its precise spatial zone.

## 6. Motion & Interaction
- **Perpetual Micro-Interactions:** Subtle state transitions. Interactive hover states utilize spring physics (`stiffness: 100, damping: 20`).
- **Cascade Loading:** List of notes animates in sequence rather than mounting instantly.
- **Editor Polish:** The `@` mention dropdown flows in gracefully using opacity/transform transitions.

## 7. Anti-Patterns (Banned)
- NO pure black (`#000000`).
- NO neon glows or heavy drop shadows.
- NO overlapping text on images.
- NO generic placeholder texts ("Scroll to explore").
- NO cliché AI copy ("Elevating your spiritual journey").
- NO centering a dense wall of text.
