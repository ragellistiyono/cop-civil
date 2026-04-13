# PLN COP Civil UPT Malang — Landing Page Design Spec

## Overview

A static landing page for PT PLN (Persero) Indonesia, department "COP Civil UPT Malang – Konstruksi", with the tagline "Membangun fondasi kuat bagi infrastruktur kelistrikan yang andal dan berkelanjutan."

**Type:** Hybrid system — public landing page now, internal SOP/guidance system behind authentication later.

**Tone:** Modern-Technical — approachable but competent. Visual icons for services, illustrated workflow, engaging/dynamic feel that communicates expertise.

**Future integration:** Appwrite (BaaS) for authentication, database, and backend services.

---

## Tech Stack

- **Framework:** Vite + React
- **Styling:** Vanilla CSS with CSS custom properties (design tokens)
- **Routing:** react-router-dom (client-side)
- **Fonts:** Google Fonts (varies per theme)
- **Icons:** Lucide React
- **No Tailwind** — vanilla CSS for full design control as required by the design system docs

---

## Theme System

Three design themes implemented via CSS custom properties, switchable via a floating UI toggle:

1. **Hand-Drawn** — Wobbly borders, handwritten fonts (Kalam, Patrick Hand), paper textures, hard offset shadows, playful rotations
2. **Neo-Brutalism** — Thick black borders, sharp corners, high-saturation colors (Space Grotesk), halftone patterns, mechanical interactions
3. **Playful Geometric** — Rounded shapes, bouncy animations, confetti decorations (Outfit, Plus Jakarta Sans), colorful palette

### Theme Switching Mechanism

- `ThemeContext` (React Context) stores current theme name
- Theme toggle sets `data-theme` attribute on `<html>` element
- CSS custom properties defined per `[data-theme="..."]` selector
- Components are 100% theme-agnostic — no JS-based style logic
- Theme-specific CSS files handle decorations/textures that can't be expressed as tokens

### Design Tokens (per theme)

Each theme defines these CSS custom properties:

```
--color-bg, --color-fg, --color-accent, --color-secondary, --color-muted, --color-border
--color-card-bg, --color-card-border
--font-heading, --font-body
--radius-sm, --radius-md, --radius-lg
--shadow-sm, --shadow-md, --shadow-lg
--shadow-hover, --shadow-active
--border-width
--transition-speed
```

---

## Navigation

### Desktop (≥768px)
- **Sticky top navbar**
- **Left:** Text logo "⚡ COP Civil" (primary) + "UPT Malang" (secondary)
- **Center/Right:** Home | Panduan | Pekerjaan Beton | Q&A
- **Far Right:** "Masuk" button (placeholder, non-functional)
- Visual style adapts per theme (wobbly vs sharp vs rounded)

### Mobile (<768px)
- **Top bar (simplified):** Logo "⚡ COP Civil" + "Masuk" button only
- **Bottom navigation bar (fixed):** App-like bottom tab bar
  - 🏠 Home
  - 📋 Panduan
  - 🏗️ Beton
  - ❓ Q&A
- Active state indicator adapts per theme
- Height: 64px minimum for touch targets
- Safe area: `padding-bottom: env(safe-area-inset-bottom)` for modern phones

---

## Landing Page Sections

### 1. Hero Section
- **Layout:** Two-column (text left, decorative right) on desktop, stacked on mobile
- **Content:**
  - Heading: "COP Civil UPT Malang" with "Konstruksi" emphasized in accent color
  - Tagline: "Membangun fondasi kuat bagi infrastruktur kelistrikan yang andal dan berkelanjutan."
  - CTAs: Primary "Lihat Panduan" + Secondary "Pelajari Lebih Lanjut"
- **Right side decorations (theme-specific):**
  - Hand-Drawn: Sketch-style construction shapes with tape/thumbtack decorations
  - Neo-Brutalism: Bold geometric shapes with hard shadows, stacked and rotated
  - Playful Geometric: Colorful shapes (circles, triangles) with confetti

### 2. Tentang Kami (About)
- **Content:** Brief description of COP Civil UPT Malang's role in PLN infrastructure. Focus on civil construction, quality assurance for electrical infrastructure, and sustainability.
- **Layout:** Text block with accent-colored sidebar highlight or pull quote

### 3. Layanan Kami (Services)
4 cards with icons (from ITP document):
1. 🏗️ **Pekerjaan Beton** — Inspeksi & pengawasan struktur beton (pondasi, kolom, balok, pelat)
2. 🔍 **Inspeksi Material** — Pemeriksaan mutu agregat, semen, besi, dan air campuran beton
3. 📋 **Digital Inspection** — Checklist digital berbasis tahapan kerja (pra-cor, saat cor, pasca-cor)
4. ✅ **Pengendalian Mutu** — Slump test, uji kuat tekan, dan monitoring mutu real-time

### 4. Alur Kerja (Workflow)
4 steps with visual connector lines (from ITP 3-phase flow):
1. **Persiapan** — Input data pekerjaan, lokasi, jenis elemen beton
2. **Pra-Pengecoran** — Inspeksi bekisting, tulangan, material
3. **Pengecoran** — Slump test, pemadatan, dokumentasi
4. **Pasca-Pengecoran** — Curing, uji mutu, laporan otomatis

### 5. Statistik / Pencapaian (Stats)
4 key numbers displayed in accent-colored containers:
- **150+** Proyek Selesai
- **15+** Tahun Pengalaman
- **50+** Tenaga Ahli
- **99%** Tingkat Keberhasilan

### 6. Footer
- PLN COP Civil UPT Malang branding
- Quick links mirroring navbar
- Contact info (placeholder): Alamat UPT Malang, email, phone
- Copyright © 2026 PT PLN (Persero)

---

## Theme Switcher Component

- **Position:** Fixed, bottom-right on desktop; above bottom navbar on mobile
- **UI:** Small floating button showing current theme icon
- **Interaction:** Click opens popover with 3 options:
  - ✏️ Hand-Drawn
  - 💥 Neo-Brutalism
  - 🔶 Playful Geometric
- **Transition:** CSS transition (300ms) on theme switch for smooth token interpolation

---

## Under Construction Pages

- Routes: `/panduan`, `/pekerjaan-beton`, `/qna`
- Centered content: Theme-appropriate icon + "Halaman Sedang Dalam Pengembangan" message
- "Kembali ke Beranda" button
- Matches current active theme

---

## Architecture

### File Structure

```
src/
├── main.jsx                        # React entry, render App
├── App.jsx                         # Router + ThemeProvider wrapper
├── styles/
│   ├── tokens.css                  # All 3 themes as CSS custom properties
│   ├── base.css                    # Reset, typography, global
│   ├── components.css              # Buttons, cards, inputs, badges
│   ├── layouts.css                 # Grid, sections, responsive
│   └── themes/
│       ├── hand-drawn.css          # Wobbly borders, paper textures, decorations
│       ├── neo-brutalism.css       # Halftone, thick borders, text-stroke
│       └── playful-geometric.css   # Confetti shapes, bouncy animations, blob radius
├── components/
│   ├── Navbar.jsx
│   ├── BottomNav.jsx               # Mobile bottom navigation
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Services.jsx
│   ├── Workflow.jsx
│   ├── Stats.jsx
│   ├── Footer.jsx
│   ├── ThemeSwitcher.jsx
│   └── UnderConstruction.jsx
├── pages/
│   └── Home.jsx                    # Assembles all landing page sections
└── context/
    └── ThemeContext.jsx             # React context for theme state + persistence
```

### Key Architectural Principles

1. **Centralized tokens** — All colors, fonts, spacing, shadows defined once in `tokens.css`. Components never use hardcoded values.
2. **Theme-agnostic components** — JSX contains zero theme-specific logic. CSS handles all visual differentiation.
3. **Theme-specific decorator CSS** — Decorations that can't be expressed as tokens (textures, patterns, custom border-radius values) live in per-theme CSS files.
4. **Composable structure** — Components are small and focused. `Home.jsx` composes them into the landing page.
5. **localStorage persistence** — Theme choice saved to localStorage and restored on page load.

---

## Responsive Strategy

- **Breakpoint:** 768px (single breakpoint: mobile vs desktop)
- **Mobile-first CSS** — Base styles are mobile, `@media (min-width: 768px)` for desktop
- **Mobile bottom nav** — 64px fixed bottom bar with safe-area padding
- **Content stacking** — All grid layouts collapse to single column on mobile
- **Touch targets** — All interactive elements minimum 48px height
- **Typography scaling** — Headings scale down on mobile

---

## Accessibility

- **WCAG AA compliant** contrast ratios for all theme palettes
- **Semantic HTML** — `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- **`aria-label`** on icon-only elements
- **`prefers-reduced-motion`** — Disable animations/transitions for users who prefer reduced motion
- **Keyboard navigation** — All interactive elements focusable with visible focus indicators
- **Skip navigation** link for screen readers
- **Single `<h1>` per page** with proper heading hierarchy
- **Unique IDs** on all interactive elements

---

## Reference Documents

- [Hand-Drawn Design System](../../design-prompt.md/Hand%20Drawn%20or%20Sketch%20Design.md)
- [Neo-Brutalism Design System](../../design-prompt.md/Neo-brutalism%20Design.md)
- [Playful Geometric Design System](../../design-prompt.md/Playful%20Geometric%20Design.md)
- [ITP Pekerjaan Sipil](../../ITP%20Pekerjaan%20Sipil.docx) — Source for services and workflow content
