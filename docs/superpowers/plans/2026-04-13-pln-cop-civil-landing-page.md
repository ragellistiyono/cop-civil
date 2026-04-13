# PLN COP Civil UPT Malang — Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static landing page for PLN COP Civil UPT Malang with 3 switchable design themes (Hand-Drawn, Neo-Brutalism, Playful Geometric).

**Architecture:** Vite + React SPA with vanilla CSS. Design tokens defined as CSS custom properties per theme via `data-theme` attribute on `<html>`. Components are theme-agnostic — CSS handles all visual differentiation. react-router-dom for client-side routing.

**Tech Stack:** Vite, React 18, react-router-dom v6, lucide-react, vanilla CSS with CSS custom properties

---

## File Structure

```
projek-mas-riski/
├── index.html                          # Vite entry HTML with Google Fonts + meta tags
├── package.json                        # Dependencies
├── vite.config.js                      # Vite config
├── src/
│   ├── main.jsx                        # React entry: renders App into DOM
│   ├── App.jsx                         # ThemeProvider + BrowserRouter + Routes + layout
│   ├── context/
│   │   └── ThemeContext.jsx            # React context: theme state + localStorage persistence
│   ├── styles/
│   │   ├── tokens.css                  # CSS custom properties for all 3 themes
│   │   ├── base.css                    # CSS reset, typography, global styles
│   │   ├── components.css              # Shared component styles (buttons, cards, badges)
│   │   ├── layouts.css                 # Section layouts, grid, responsive utilities
│   │   └── themes/
│   │       ├── hand-drawn.css          # Wobbly borders, paper texture, tape decorations
│   │       ├── neo-brutalism.css       # Halftone, thick borders, text-stroke effects
│   │       └── playful-geometric.css   # Confetti, bouncy animations, blob shapes
│   ├── components/
│   │   ├── Navbar.jsx                  # Desktop top navbar
│   │   ├── BottomNav.jsx              # Mobile bottom navigation bar
│   │   ├── Hero.jsx                    # Hero section with CTAs and decorative area
│   │   ├── About.jsx                   # Tentang Kami section
│   │   ├── Services.jsx               # 4 service cards
│   │   ├── Workflow.jsx               # 4-step process with connectors
│   │   ├── Stats.jsx                   # 4 stat numbers
│   │   ├── Footer.jsx                 # Footer with links and contact
│   │   ├── ThemeSwitcher.jsx          # Floating theme toggle
│   │   └── UnderConstruction.jsx      # Placeholder page for unbuilt routes
│   └── pages/
│       └── Home.jsx                    # Assembles all landing page sections
```

---

### Task 1: Project Setup & Dependencies

**Files:**

- Create: `index.html`, `package.json`, `vite.config.js`, `src/main.jsx`, `.gitignore`

- [ ] **Step 1: Install Node.js**

Node.js is not installed on this system. Install via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify: `node --version` should output `v20.x.x` or higher. `npm --version` should output `10.x.x` or higher.

- [ ] **Step 2: Scaffold Vite React project**

```bash
cd /home/ragel/Documents/projek-c/projek-mas-riski
npm create vite@latest ./ -- --template react
```

If prompted about existing files, confirm overwrite. This creates the Vite boilerplate.

Expected: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, etc.

- [ ] **Step 3: Install dependencies**

```bash
npm install react-router-dom lucide-react
```

- [ ] **Step 4: Clean up Vite boilerplate**

Remove generated files we don't need:

```bash
rm -f src/App.css src/index.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 5: Update index.html**

Replace the generated `index.html` with:

```html
<!doctype html>
<html lang="id" data-theme="hand-drawn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="COP Civil UPT Malang – Konstruksi. Membangun fondasi kuat bagi infrastruktur kelistrikan yang andal dan berkelanjutan. PT PLN (Persero) Indonesia."
    />
    <title>COP Civil UPT Malang – Konstruksi | PT PLN (Persero)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&family=Space+Grotesk:wght@400;500;700;900&family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Update src/main.jsx**

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/layouts.css";
import "./styles/themes/hand-drawn.css";
import "./styles/themes/neo-brutalism.css";
import "./styles/themes/playful-geometric.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 7: Update .gitignore**

Append to the generated `.gitignore`:

```
# Unpacked docx
docs/itp-unpacked/
# Superpowers brainstorm
.superpowers/
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173` with no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React project with dependencies"
```

---

### Task 2: Design Token System

**Files:**

- Create: `src/styles/tokens.css`

- [ ] **Step 1: Create tokens.css with all 3 theme token sets**

Create `src/styles/tokens.css`:

```css
/* ============================================
   Design Token System
   All 3 themes define tokens as CSS custom properties.
   Components reference var(--token-name), never hardcoded values.
   ============================================ */

/* --- Theme 1: Hand-Drawn --- */
[data-theme="hand-drawn"] {
  /* Colors */
  --color-bg: #fdfbf7;
  --color-fg: #2d2d2d;
  --color-accent: #ff4d4d;
  --color-secondary: #2d5da1;
  --color-muted: #e5e0d8;
  --color-border: #2d2d2d;
  --color-card-bg: #ffffff;
  --color-card-border: #2d2d2d;
  --color-card-feature-bg: #fff9c4;
  --color-white: #ffffff;

  /* Typography */
  --font-heading: "Kalam", cursive;
  --font-body: "Patrick Hand", cursive;
  --font-weight-heading: 700;
  --font-weight-body: 400;

  /* Radius */
  --radius-sm: 255px 15px 225px 15px / 15px 225px 15px 255px;
  --radius-md: 15px 225px 15px 255px / 255px 15px 225px 15px;
  --radius-lg: 225px 15px 255px 15px / 15px 255px 15px 225px;
  --radius-pill: 255px 15px 225px 15px / 15px 225px 15px 255px;
  --radius-circle: 50%;

  /* Borders */
  --border-width: 2px;
  --border-width-thick: 3px;
  --border-style: solid;

  /* Shadows */
  --shadow-sm: 3px 3px 0px 0px rgba(45, 45, 45, 0.15);
  --shadow-md: 4px 4px 0px 0px #2d2d2d;
  --shadow-lg: 8px 8px 0px 0px #2d2d2d;
  --shadow-hover: 2px 2px 0px 0px #2d2d2d;
  --shadow-active: none;

  /* Transitions */
  --transition-speed: 100ms;
  --transition-easing: ease-out;

  /* Spacing */
  --section-padding-y: 5rem;
  --container-max-width: 64rem;
  --gap: 2rem;
}

/* --- Theme 2: Neo-Brutalism --- */
[data-theme="neo-brutalism"] {
  /* Colors */
  --color-bg: #fffdf5;
  --color-fg: #000000;
  --color-accent: #ff6b6b;
  --color-secondary: #ffd93d;
  --color-muted: #c4b5fd;
  --color-border: #000000;
  --color-card-bg: #ffffff;
  --color-card-border: #000000;
  --color-card-feature-bg: #ffd93d;
  --color-white: #ffffff;

  /* Typography */
  --font-heading: "Space Grotesk", sans-serif;
  --font-body: "Space Grotesk", sans-serif;
  --font-weight-heading: 900;
  --font-weight-body: 700;

  /* Radius */
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-pill: 9999px;
  --radius-circle: 50%;

  /* Borders */
  --border-width: 4px;
  --border-width-thick: 8px;
  --border-style: solid;

  /* Shadows */
  --shadow-sm: 4px 4px 0px 0px #000;
  --shadow-md: 8px 8px 0px 0px #000;
  --shadow-lg: 12px 12px 0px 0px #000;
  --shadow-hover: 10px 10px 0px 0px #000;
  --shadow-active: none;

  /* Transitions */
  --transition-speed: 100ms;
  --transition-easing: linear;

  /* Spacing */
  --section-padding-y: 5rem;
  --container-max-width: 72rem;
  --gap: 2rem;
}

/* --- Theme 3: Playful Geometric --- */
[data-theme="playful-geometric"] {
  /* Colors */
  --color-bg: #fffdf5;
  --color-fg: #1e293b;
  --color-accent: #8b5cf6;
  --color-secondary: #f472b6;
  --color-muted: #f1f5f9;
  --color-border: #e2e8f0;
  --color-card-bg: #ffffff;
  --color-card-border: #1e293b;
  --color-card-feature-bg: #fbbf24;
  --color-tertiary: #fbbf24;
  --color-quaternary: #34d399;
  --color-white: #ffffff;

  /* Typography */
  --font-heading: "Outfit", sans-serif;
  --font-body: "Plus Jakarta Sans", sans-serif;
  --font-weight-heading: 800;
  --font-weight-body: 400;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 9999px;
  --radius-circle: 50%;

  /* Borders */
  --border-width: 2px;
  --border-width-thick: 3px;
  --border-style: solid;

  /* Shadows */
  --shadow-sm: 4px 4px 0px 0px #1e293b;
  --shadow-md: 6px 6px 0px 0px #1e293b;
  --shadow-lg: 8px 8px 0px 0px #e2e8f0;
  --shadow-hover: 6px 6px 0px 0px #1e293b;
  --shadow-active: 2px 2px 0px 0px #1e293b;

  /* Transitions */
  --transition-speed: 300ms;
  --transition-easing: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Spacing */
  --section-padding-y: 6rem;
  --container-max-width: 72rem;
  --gap: 2rem;
}
```

- [ ] **Step 2: Verify tokens load**

Start dev server (`npm run dev`) and inspect `<html>` element in browser DevTools. It should have `data-theme="hand-drawn"` and all custom properties visible in the computed styles.

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat: add design token system for 3 themes"
```

---

### Task 3: Base Styles & CSS Reset

**Files:**

- Create: `src/styles/base.css`

- [ ] **Step 1: Create base.css**

Create `src/styles/base.css`:

```css
/* ============================================
   Base Styles: Reset, Typography, Globals
   ============================================ */

/* --- CSS Reset --- */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-body);
  font-weight: var(--font-weight-body);
  color: var(--color-fg);
  background-color: var(--color-bg);
  line-height: 1.6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

ul,
ol {
  list-style: none;
}

/* --- Typography --- */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

h1 {
  font-size: clamp(2.25rem, 5vw, 3.75rem);
}

h2 {
  font-size: clamp(1.75rem, 4vw, 3rem);
}

h3 {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
}

p {
  max-width: 65ch;
}

/* --- Skip Navigation (a11y) --- */
.skip-nav {
  position: absolute;
  top: -100%;
  left: 1rem;
  z-index: 9999;
  padding: 0.75rem 1.5rem;
  background: var(--color-accent);
  color: var(--color-white);
  font-weight: 700;
  border-radius: 0 0 8px 8px;
  transition: top 0.2s;
}

.skip-nav:focus {
  top: 0;
}

/* --- Reduced Motion --- */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* --- Selection --- */
::selection {
  background-color: var(--color-accent);
  color: var(--color-white);
}
```

- [ ] **Step 2: Verify base styles**

Dev server should show a clean page with the correct background color and font from the hand-drawn theme (default).

- [ ] **Step 3: Commit**

```bash
git add src/styles/base.css
git commit -m "feat: add base CSS reset and typography"
```

---

### Task 4: Component & Layout Styles

**Files:**

- Create: `src/styles/components.css`, `src/styles/layouts.css`

- [ ] **Step 1: Create components.css**

Create `src/styles/components.css`:

```css
/* ============================================
   Shared Component Styles
   ============================================ */

/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 1rem;
  line-height: 1;
  border: var(--border-width) var(--border-style) var(--color-border);
  cursor: pointer;
  transition: all var(--transition-speed) var(--transition-easing);
  min-height: 48px;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--color-accent);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-active);
}

.btn-secondary {
  background-color: var(--color-card-bg);
  color: var(--color-fg);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover {
  background-color: var(--color-secondary);
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-active);
}

/* Focus visible for keyboard navigation */
.btn:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

/* --- Cards --- */
.card {
  background-color: var(--color-card-bg);
  border: var(--border-width) var(--border-style) var(--color-card-border);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
  transition: all var(--transition-speed) var(--transition-easing);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border: var(--border-width) var(--border-style) var(--color-border);
  margin-bottom: 1rem;
  color: var(--color-accent);
  background-color: var(--color-bg);
}

.card-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.card-text {
  font-size: 0.95rem;
  opacity: 0.85;
  line-height: 1.5;
}

/* --- Badge --- */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: var(--border-width) var(--border-style) var(--color-border);
  background-color: var(--color-secondary);
}

/* --- Stat Item --- */
.stat-item {
  text-align: center;
  padding: 1.5rem;
}

.stat-number {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--color-accent);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* --- Section Header --- */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-subtitle {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-accent);
  margin-bottom: 0.75rem;
}

.section-title {
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.1rem;
  opacity: 0.8;
  max-width: 50ch;
  margin: 0 auto;
}

/* --- Workflow Step --- */
.workflow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.workflow-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.5rem;
  border: var(--border-width-thick) var(--border-style) var(--color-border);
  background-color: var(--color-accent);
  color: var(--color-white);
  margin-bottom: 1rem;
  z-index: 1;
}

.workflow-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}

.workflow-text {
  font-size: 0.9rem;
  opacity: 0.8;
  max-width: 20ch;
}
```

- [ ] **Step 2: Create layouts.css**

Create `src/styles/layouts.css`:

```css
/* ============================================
   Layout Styles: Containers, Grids, Sections
   ============================================ */

/* --- Container --- */
.container {
  width: 100%;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* --- Sections --- */
.section {
  padding: var(--section-padding-y) 0;
  position: relative;
  overflow: hidden;
}

.section-alt {
  background-color: var(--color-muted);
}

/* --- Grid Systems --- */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap);
}

/* --- Hero Layout --- */
.hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-tagline {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  opacity: 0.85;
  max-width: 45ch;
  line-height: 1.6;
}

.hero-cta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-visual {
  position: relative;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- Workflow Layout --- */
.workflow-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  position: relative;
}

/* --- Stats Layout --- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap);
}

/* --- Footer Layout --- */
.footer {
  padding: 3rem 0 1.5rem;
  border-top: var(--border-width) var(--border-style) var(--color-border);
  background-color: var(--color-fg);
  color: var(--color-bg);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-heading {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-accent);
}

.footer-link {
  display: block;
  padding: 0.25rem 0;
  opacity: 0.8;
  transition: opacity var(--transition-speed);
}

.footer-link:hover {
  opacity: 1;
  color: var(--color-accent);
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.85rem;
  opacity: 0.6;
}

/* --- Navbar Layout --- */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg);
  border-bottom: var(--border-width) var(--border-style) var(--color-border);
  padding: 0 1.5rem;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--container-max-width);
  margin: 0 auto;
  height: 4rem;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.25rem;
}

.navbar-logo-secondary {
  font-size: 0.8rem;
  opacity: 0.7;
  font-weight: 400;
}

.navbar-links {
  display: none;
  align-items: center;
  gap: 0.25rem;
}

.navbar-link {
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  border: 2px solid transparent;
  transition: all var(--transition-speed) var(--transition-easing);
}

.navbar-link:hover,
.navbar-link.active {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.navbar-link:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.navbar-login {
  display: none;
}

/* --- Bottom Navigation (Mobile) --- */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: var(--color-bg);
  border-top: var(--border-width) var(--border-style) var(--color-border);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.bottom-nav-inner {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 4rem;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  min-width: 4rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-fg);
  opacity: 0.55;
  transition: all var(--transition-speed) var(--transition-easing);
  border: none;
  background: none;
  cursor: pointer;
  text-decoration: none;
}

.bottom-nav-item:hover,
.bottom-nav-item.active {
  opacity: 1;
  color: var(--color-accent);
}

.bottom-nav-item.active {
  transform: translateY(-2px);
}

/* Spacer for bottom nav so content isn't hidden behind it */
.bottom-nav-spacer {
  display: block;
  height: calc(4rem + env(safe-area-inset-bottom, 0px));
}

/* --- Theme Switcher --- */
.theme-switcher {
  position: fixed;
  z-index: 99;
  bottom: 5.5rem;
  right: 1rem;
}

.theme-switcher-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border: var(--border-width) var(--border-style) var(--color-border);
  background-color: var(--color-card-bg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-speed) var(--transition-easing);
  font-size: 1.25rem;
}

.theme-switcher-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.theme-switcher-btn:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.theme-switcher-popover {
  position: absolute;
  bottom: calc(100% + 0.75rem);
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--color-card-bg);
  border: var(--border-width) var(--border-style) var(--color-border);
  box-shadow: var(--shadow-md);
  min-width: 12rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: all 200ms ease-out;
}

.theme-switcher-popover.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid transparent;
  background: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.85rem;
  text-align: left;
  transition: all var(--transition-speed);
  min-height: 44px;
  width: 100%;
}

.theme-option:hover {
  border-color: var(--color-border);
  background-color: var(--color-muted);
}

.theme-option.active {
  border-color: var(--color-accent);
  background-color: var(--color-accent);
  color: var(--color-white);
}

.theme-option:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* --- Under Construction --- */
.under-construction {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
  gap: 1.5rem;
}

.under-construction-icon {
  font-size: 4rem;
  color: var(--color-accent);
}

.under-construction h2 {
  font-family: var(--font-heading);
}

.under-construction p {
  opacity: 0.7;
  max-width: 40ch;
}

/* --- Desktop Responsive --- */
@media (min-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr 1fr;
  }

  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  .workflow-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .footer-grid {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }

  .navbar-links {
    display: flex;
  }

  .navbar-login {
    display: inline-flex;
  }

  .bottom-nav {
    display: none;
  }

  .bottom-nav-spacer {
    display: none;
  }

  .theme-switcher {
    bottom: 1.5rem;
    right: 1.5rem;
  }
}
```

- [ ] **Step 3: Verify layout renders**

Create a temporary `App.jsx` with a container div and some test content to confirm styles apply. Dev server should show styled content.

- [ ] **Step 4: Commit**

```bash
git add src/styles/components.css src/styles/layouts.css
git commit -m "feat: add component and layout styles"
```

---

### Task 5: Theme-Specific CSS Files

**Files:**

- Create: `src/styles/themes/hand-drawn.css`, `src/styles/themes/neo-brutalism.css`, `src/styles/themes/playful-geometric.css`

- [ ] **Step 1: Create hand-drawn.css**

Create `src/styles/themes/hand-drawn.css`:

```css
/* ============================================
   Theme: Hand-Drawn
   Wobbly borders, paper texture, tape/thumbtack decorations
   ============================================ */

/* Paper dot grid background */
[data-theme="hand-drawn"] body {
  background-image: radial-gradient(var(--color-muted) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Wobbly border-radius overrides */
[data-theme="hand-drawn"] .btn {
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
}

[data-theme="hand-drawn"] .card {
  border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px;
}

[data-theme="hand-drawn"] .card:hover {
  transform: rotate(-1deg) translateY(-4px);
}

[data-theme="hand-drawn"] .card-icon {
  border-radius: 50%;
  border-style: dashed;
}

[data-theme="hand-drawn"] .workflow-number {
  border-radius: 50%;
}

[data-theme="hand-drawn"] .stat-item {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  background-color: var(--color-card-bg);
}

[data-theme="hand-drawn"] .badge {
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  transform: rotate(-2deg);
}

[data-theme="hand-drawn"] .navbar {
  border-bottom-style: dashed;
}

[data-theme="hand-drawn"] .navbar-link:hover,
[data-theme="hand-drawn"] .navbar-link.active {
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  background-color: var(--color-muted);
}

[data-theme="hand-drawn"] .bottom-nav {
  border-top-style: dashed;
}

[data-theme="hand-drawn"] .theme-switcher-btn {
  border-radius: 50%;
  border-style: dashed;
}

[data-theme="hand-drawn"] .theme-switcher-popover {
  border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px;
  border-style: dashed;
}

[data-theme="hand-drawn"] .theme-option {
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
}

/* Hand-drawn decorative elements */
[data-theme="hand-drawn"] .hero-visual::before {
  content: "";
  position: absolute;
  top: 10%;
  right: 10%;
  width: 80px;
  height: 80px;
  border: 3px dashed var(--color-accent);
  border-radius: 50%;
  animation: gentle-bounce 3s ease-in-out infinite;
}

[data-theme="hand-drawn"] .hero-visual::after {
  content: "";
  position: absolute;
  bottom: 15%;
  left: 5%;
  width: 60px;
  height: 60px;
  background-color: var(--color-card-feature-bg);
  border: 2px solid var(--color-border);
  border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px;
  transform: rotate(12deg);
}

/* Section-title wavy underline */
[data-theme="hand-drawn"] .section-title::after {
  content: "";
  display: block;
  width: 120px;
  height: 6px;
  margin: 0.75rem auto 0;
  background: var(--color-accent);
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  transform: rotate(-1deg);
}

@keyframes gentle-bounce {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-12px) rotate(5deg);
  }
}
```

- [ ] **Step 2: Create neo-brutalism.css**

Create `src/styles/themes/neo-brutalism.css`:

```css
/* ============================================
   Theme: Neo-Brutalism
   Thick borders, halftone, mechanical interactions
   ============================================ */

/* Halftone dot grid background */
[data-theme="neo-brutalism"] body {
  background-image: radial-gradient(#000 1px, transparent 1px);
  background-size: 24px 24px;
  background-color: var(--color-bg);
}

/* Sharp corners, thick borders */
[data-theme="neo-brutalism"] .btn {
  border-radius: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 900;
  font-family: var(--font-heading);
}

[data-theme="neo-brutalism"] .btn-primary:hover {
  transform: translate(-1px, -1px);
}

[data-theme="neo-brutalism"] .btn-primary:active {
  transform: translate(4px, 4px);
}

[data-theme="neo-brutalism"] .card {
  border-radius: 0;
  border-width: 4px;
}

[data-theme="neo-brutalism"] .card:hover {
  transform: translateY(-6px);
  box-shadow: 12px 12px 0px 0px #000;
}

[data-theme="neo-brutalism"] .card-icon {
  border-radius: 0;
  border-width: 4px;
  background-color: var(--color-secondary);
}

[data-theme="neo-brutalism"] .workflow-number {
  border-radius: 0;
  border-width: 4px;
}

[data-theme="neo-brutalism"] .stat-item {
  border: 4px solid var(--color-border);
  background-color: var(--color-card-bg);
  box-shadow: var(--shadow-sm);
}

[data-theme="neo-brutalism"] .stat-item:nth-child(2) {
  background-color: var(--color-secondary);
}

[data-theme="neo-brutalism"] .stat-item:nth-child(3) {
  background-color: var(--color-muted);
}

[data-theme="neo-brutalism"] .badge {
  border-radius: 0;
  border-width: 4px;
  font-weight: 900;
  letter-spacing: 0.15em;
  transform: rotate(2deg);
}

[data-theme="neo-brutalism"] .navbar {
  border-bottom-width: 4px;
}

[data-theme="neo-brutalism"] .navbar-logo {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

[data-theme="neo-brutalism"] .navbar-link {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 900;
}

[data-theme="neo-brutalism"] .navbar-link:hover,
[data-theme="neo-brutalism"] .navbar-link.active {
  background-color: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
}

[data-theme="neo-brutalism"] .bottom-nav {
  border-top-width: 4px;
}

[data-theme="neo-brutalism"] .bottom-nav-item {
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

[data-theme="neo-brutalism"] .theme-switcher-btn {
  border-radius: 0;
  border-width: 4px;
}

[data-theme="neo-brutalism"] .theme-switcher-popover {
  border-radius: 0;
  border-width: 4px;
}

[data-theme="neo-brutalism"] .section-header {
  text-transform: uppercase;
}

[data-theme="neo-brutalism"] .section-subtitle {
  font-weight: 900;
  letter-spacing: 0.2em;
}

/* Neo section-title decoration: thick bar */
[data-theme="neo-brutalism"] .section-title::after {
  content: "";
  display: block;
  width: 80px;
  height: 8px;
  margin: 1rem auto 0;
  background: var(--color-fg);
}

/* Hero decorative blocks */
[data-theme="neo-brutalism"] .hero-visual::before {
  content: "";
  position: absolute;
  top: 5%;
  right: 5%;
  width: 100px;
  height: 100px;
  background-color: var(--color-secondary);
  border: 4px solid var(--color-border);
  box-shadow: 8px 8px 0px 0px #000;
  transform: rotate(12deg);
}

[data-theme="neo-brutalism"] .hero-visual::after {
  content: "";
  position: absolute;
  bottom: 10%;
  left: 10%;
  width: 70px;
  height: 70px;
  background-color: var(--color-muted);
  border: 4px solid var(--color-border);
  box-shadow: 6px 6px 0px 0px #000;
  transform: rotate(-8deg);
}

/* Footer thick border */
[data-theme="neo-brutalism"] .footer {
  border-top-width: 4px;
}

/* Slow spin animation for decorative elements */
@keyframes neo-spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

- [ ] **Step 3: Create playful-geometric.css**

Create `src/styles/themes/playful-geometric.css`:

```css
/* ============================================
   Theme: Playful Geometric
   Bouncy animations, confetti, blob shapes
   ============================================ */

/* Dot grid background */
[data-theme="playful-geometric"] body {
  background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
  background-size: 30px 30px;
}

/* Rounded pill buttons */
[data-theme="playful-geometric"] .btn {
  border-radius: 9999px;
}

[data-theme="playful-geometric"] .btn-primary:hover {
  transform: translate(-2px, -2px) scale(1.02);
}

[data-theme="playful-geometric"] .btn-secondary:hover {
  background-color: var(--color-tertiary, #fbbf24);
}

/* Rounded cards with wiggle on hover */
[data-theme="playful-geometric"] .card {
  border-radius: 16px;
}

[data-theme="playful-geometric"] .card:hover {
  transform: rotate(-1deg) scale(1.02);
}

[data-theme="playful-geometric"] .card-icon {
  border-radius: 50%;
  background-color: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-card-border);
}

[data-theme="playful-geometric"] .card:nth-child(2) .card-icon {
  background-color: var(--color-secondary);
}

[data-theme="playful-geometric"] .card:nth-child(3) .card-icon {
  background-color: var(--color-tertiary, #fbbf24);
  color: var(--color-fg);
}

[data-theme="playful-geometric"] .card:nth-child(4) .card-icon {
  background-color: var(--color-quaternary, #34d399);
  color: var(--color-fg);
}

[data-theme="playful-geometric"] .workflow-number {
  border-radius: 50%;
}

[data-theme="playful-geometric"] .stat-item {
  border: var(--border-width) solid var(--color-card-border);
  border-radius: 16px;
  background-color: var(--color-card-bg);
  box-shadow: var(--shadow-sm);
}

[data-theme="playful-geometric"] .stat-item:nth-child(1) {
  box-shadow: 4px 4px 0px 0px var(--color-accent);
}
[data-theme="playful-geometric"] .stat-item:nth-child(2) {
  box-shadow: 4px 4px 0px 0px var(--color-secondary);
}
[data-theme="playful-geometric"] .stat-item:nth-child(3) {
  box-shadow: 4px 4px 0px 0px var(--color-tertiary, #fbbf24);
}
[data-theme="playful-geometric"] .stat-item:nth-child(4) {
  box-shadow: 4px 4px 0px 0px var(--color-quaternary, #34d399);
}

[data-theme="playful-geometric"] .badge {
  border-radius: 9999px;
  background-color: var(--color-accent);
  color: var(--color-white);
}

[data-theme="playful-geometric"] .navbar-link:hover,
[data-theme="playful-geometric"] .navbar-link.active {
  border-radius: 9999px;
  background-color: var(--color-accent);
  color: var(--color-white);
  border-color: transparent;
}

[data-theme="playful-geometric"] .theme-switcher-btn {
  border-radius: 50%;
}

[data-theme="playful-geometric"] .theme-switcher-popover {
  border-radius: 16px;
}

[data-theme="playful-geometric"] .theme-option {
  border-radius: 12px;
}

/* Squiggly section title underline */
[data-theme="playful-geometric"] .section-title::after {
  content: "~~~~~";
  display: block;
  font-size: 1.75rem;
  letter-spacing: 0.15em;
  color: var(--color-accent);
  margin-top: 0.25rem;
  font-style: italic;
}

/* Hero decorative shapes */
[data-theme="playful-geometric"] .hero-visual::before {
  content: "";
  position: absolute;
  top: 10%;
  right: 5%;
  width: 90px;
  height: 90px;
  background-color: var(--color-tertiary, #fbbf24);
  border: 2px solid var(--color-card-border);
  border-radius: 50%;
  opacity: 0.7;
  animation: geometric-float 4s ease-in-out infinite;
}

[data-theme="playful-geometric"] .hero-visual::after {
  content: "";
  position: absolute;
  bottom: 15%;
  left: 10%;
  width: 0;
  height: 0;
  border-left: 35px solid transparent;
  border-right: 35px solid transparent;
  border-bottom: 60px solid var(--color-secondary);
  opacity: 0.6;
  transform: rotate(15deg);
  animation: geometric-float 5s ease-in-out infinite reverse;
}

/* Wiggle animation for icons */
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(3deg);
  }
  75% {
    transform: rotate(-3deg);
  }
}

@keyframes geometric-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(10deg);
  }
}

[data-theme="playful-geometric"] .card-icon:hover {
  animation: wiggle 0.3s ease-in-out;
}
```

- [ ] **Step 4: Verify all theme CSS files load**

Check browser DevTools — all 3 CSS files should be loaded. Only the active theme's styles should apply (based on `data-theme` attribute).

- [ ] **Step 5: Commit**

```bash
git add src/styles/themes/
git commit -m "feat: add theme-specific CSS for hand-drawn, neo-brutalism, playful-geometric"
```

---

### Task 6: Theme Context & App Shell

**Files:**

- Create: `src/context/ThemeContext.jsx`, `src/App.jsx`

- [ ] **Step 1: Create ThemeContext.jsx**

Create `src/context/ThemeContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from "react";

const THEMES = ["hand-drawn", "neo-brutalism", "playful-geometric"];
const STORAGE_KEY = "pln-cop-theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(saved) ? saved : THEMES[0];
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((prev) => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, cycleTheme, themes: THEMES }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

- [ ] **Step 2: Create App.jsx**

Create `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Home from "./pages/Home";
import UnderConstruction from "./components/UnderConstruction";

function AppLayout() {
  const location = useLocation();

  return (
    <>
      <a href="#main-content" className="skip-nav">
        Langsung ke konten utama
      </a>
      <Navbar currentPath={location.pathname} />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/panduan"
            element={<UnderConstruction title="Panduan" />}
          />
          <Route
            path="/pekerjaan-beton"
            element={<UnderConstruction title="Pekerjaan Beton" />}
          />
          <Route path="/qna" element={<UnderConstruction title="Q & A" />} />
        </Routes>
      </main>
      <BottomNav currentPath={location.pathname} />
      <ThemeSwitcher />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Verify context works**

Add a temporary console.log in App.jsx to verify theme changes propagate. Check localStorage in DevTools.

- [ ] **Step 4: Commit**

```bash
git add src/context/ThemeContext.jsx src/App.jsx
git commit -m "feat: add theme context and app shell with routing"
```

---

### Task 7: Navbar & Bottom Navigation Components

**Files:**

- Create: `src/components/Navbar.jsx`, `src/components/BottomNav.jsx`

- [ ] **Step 1: Create Navbar.jsx**

Create `src/components/Navbar.jsx`:

```jsx
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/panduan", label: "Panduan" },
  { path: "/pekerjaan-beton", label: "Pekerjaan Beton" },
  { path: "/qna", label: "Q & A" },
];

export default function Navbar({ currentPath }) {
  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <Link
          to="/"
          className="navbar-logo"
          aria-label="COP Civil UPT Malang - Beranda"
        >
          <Zap size={22} strokeWidth={2.5} />
          <span>COP Civil</span>
          <span className="navbar-logo-secondary">UPT Malang</span>
        </Link>

        <nav className="navbar-links" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-link${currentPath === item.path ? " active" : ""}`}
              aria-current={currentPath === item.path ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="btn btn-primary navbar-login"
          aria-label="Masuk ke akun"
        >
          Masuk
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create BottomNav.jsx**

Create `src/components/BottomNav.jsx`:

```jsx
import { Link } from "react-router-dom";
import { Home, BookOpen, HardHat, HelpCircle } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/panduan", label: "Panduan", icon: BookOpen },
  { path: "/pekerjaan-beton", label: "Beton", icon: HardHat },
  { path: "/qna", label: "Q&A", icon: HelpCircle },
];

export default function BottomNav({ currentPath }) {
  return (
    <>
      <nav className="bottom-nav" aria-label="Navigasi mobile">
        <div className="bottom-nav-inner">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item${currentPath === item.path ? " active" : ""}`}
              aria-current={currentPath === item.path ? "page" : undefined}
              aria-label={item.label}
            >
              <item.icon size={22} strokeWidth={2.5} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <div className="bottom-nav-spacer" aria-hidden="true" />
    </>
  );
}
```

- [ ] **Step 3: Verify navbar renders**

Dev server should show desktop top navbar (with working links) and bottom navbar on mobile viewport (≤768px). Links should navigate between routes.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.jsx src/components/BottomNav.jsx
git commit -m "feat: add Navbar and BottomNav components"
```

---

### Task 8: Theme Switcher Component

**Files:**

- Create: `src/components/ThemeSwitcher.jsx`

- [ ] **Step 1: Create ThemeSwitcher.jsx**

Create `src/components/ThemeSwitcher.jsx`:

```jsx
import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const THEME_META = {
  "hand-drawn": { emoji: "✏️", label: "Hand-Drawn" },
  "neo-brutalism": { emoji: "💥", label: "Neo-Brutalism" },
  "playful-geometric": { emoji: "🔶", label: "Playful Geometric" },
};

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div className="theme-switcher" ref={containerRef}>
      <div
        className={`theme-switcher-popover${isOpen ? " open" : ""}`}
        role="listbox"
        aria-label="Pilih tema"
      >
        {themes.map((t) => (
          <button
            key={t}
            className={`theme-option${theme === t ? " active" : ""}`}
            onClick={() => {
              setTheme(t);
              setIsOpen(false);
            }}
            role="option"
            aria-selected={theme === t}
          >
            <span aria-hidden="true">{THEME_META[t].emoji}</span>
            {THEME_META[t].label}
          </button>
        ))}
      </div>
      <button
        className="theme-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ganti tema tampilan"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Palette size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify theme switching**

Click the theme switcher button. Popover should appear with 3 options. Clicking an option should:

1. Change `data-theme` attribute on `<html>`
2. Immediately re-skin the entire page
3. Persist to localStorage (refresh page to verify)

- [ ] **Step 3: Commit**

```bash
git add src/components/ThemeSwitcher.jsx
git commit -m "feat: add ThemeSwitcher component with persistence"
```

---

### Task 9: Landing Page Sections — Hero, About, Services

**Files:**

- Create: `src/components/Hero.jsx`, `src/components/About.jsx`, `src/components/Services.jsx`

- [ ] **Step 1: Create Hero.jsx**

Create `src/components/Hero.jsx`:

```jsx
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="section hero-section" aria-labelledby="hero-heading">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="badge">PT PLN (Persero)</span>
            <h1 id="hero-heading">
              COP Civil UPT Malang
              <br />
              <span className="hero-accent">Konstruksi</span>
            </h1>
            <p className="hero-tagline">
              Membangun fondasi kuat bagi infrastruktur kelistrikan yang andal
              dan berkelanjutan.
            </p>
            <div className="hero-cta-group">
              <Link to="/panduan" className="btn btn-primary">
                Lihat Panduan
                <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
              <a href="#tentang" className="btn btn-secondary">
                Pelajari Lebih Lanjut
                <ChevronDown size={18} strokeWidth={2.5} />
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-shape hero-shape-1" />
            <div className="hero-shape hero-shape-2" />
            <div className="hero-shape hero-shape-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create About.jsx**

Create `src/components/About.jsx`:

```jsx
import { Shield, Target } from "lucide-react";

export default function About() {
  return (
    <section
      className="section section-alt"
      id="tentang"
      aria-labelledby="about-heading"
    >
      <div className="container">
        <div className="section-header">
          <p className="section-subtitle">Tentang Kami</p>
          <h2 className="section-title" id="about-heading">
            COP Civil UPT Malang
          </h2>
        </div>
        <div className="about-content">
          <div className="about-text">
            <p>
              COP Civil UPT Malang merupakan bagian dari PT PLN (Persero) yang
              bertanggung jawab atas pengawasan dan pengendalian mutu pekerjaan
              sipil dalam proyek konstruksi infrastruktur kelistrikan di wilayah
              UPT Malang.
            </p>
            <p>
              Tim kami memastikan setiap tahapan konstruksi — mulai dari
              perencanaan, pelaksanaan, hingga serah terima — memenuhi standar
              teknis yang ditetapkan dalam Rencana Kerja dan Syarat-syarat
              (RKS), sehingga menghasilkan infrastruktur yang aman, andal, dan
              berkelanjutan.
            </p>
          </div>
          <div className="about-highlights">
            <div className="about-highlight-item">
              <Shield size={24} strokeWidth={2.5} />
              <div>
                <strong>Standar Mutu Tinggi</strong>
                <p>
                  Setiap pekerjaan diawasi berdasarkan Inspection & Test Plan
                  (ITP) yang terstandar.
                </p>
              </div>
            </div>
            <div className="about-highlight-item">
              <Target size={24} strokeWidth={2.5} />
              <div>
                <strong>Digital Inspection</strong>
                <p>
                  Sistem inspeksi digital yang terstruktur untuk pengendalian
                  mutu yang konsisten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create Services.jsx**

Create `src/components/Services.jsx`:

```jsx
import { HardHat, Search, ClipboardCheck, ShieldCheck } from "lucide-react";

const SERVICES = [
  {
    icon: HardHat,
    title: "Pekerjaan Beton",
    description:
      "Inspeksi & pengawasan struktur beton meliputi pondasi, kolom, balok, dan pelat lantai.",
  },
  {
    icon: Search,
    title: "Inspeksi Material",
    description:
      "Pemeriksaan mutu agregat, semen, besi, dan air campuran beton sesuai spesifikasi RKS.",
  },
  {
    icon: ClipboardCheck,
    title: "Digital Inspection",
    description:
      "Checklist digital berbasis tahapan kerja: pra-pengecoran, saat pengecoran, dan pasca-pengecoran.",
  },
  {
    icon: ShieldCheck,
    title: "Pengendalian Mutu",
    description:
      "Slump test, uji kuat tekan, pemadatan beton, dan monitoring mutu secara real-time.",
  },
];

export default function Services() {
  return (
    <section className="section" aria-labelledby="services-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-subtitle">Layanan Kami</p>
          <h2 className="section-title" id="services-heading">
            Lingkup Pekerjaan
          </h2>
          <p className="section-description">
            Bidang keahlian utama dalam pengawasan dan pengendalian mutu
            pekerjaan sipil.
          </p>
        </div>
        <div className="grid-4">
          {SERVICES.map((service, index) => (
            <div className="card" key={index}>
              <div className="card-icon" aria-hidden="true">
                <service.icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="card-title">{service.title}</h3>
              <p className="card-text">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify components render**

Temporarily import Hero, About, Services into Home.jsx or App.jsx and check they render with correct styles across all 3 themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.jsx src/components/About.jsx src/components/Services.jsx
git commit -m "feat: add Hero, About, and Services sections"
```

---

### Task 10: Landing Page Sections — Workflow, Stats, Footer

**Files:**

- Create: `src/components/Workflow.jsx`, `src/components/Stats.jsx`, `src/components/Footer.jsx`

- [ ] **Step 1: Create Workflow.jsx**

Create `src/components/Workflow.jsx`:

```jsx
const STEPS = [
  {
    number: "1",
    title: "Persiapan",
    description: "Input data pekerjaan, lokasi, jenis elemen beton",
  },
  {
    number: "2",
    title: "Pra-Pengecoran",
    description: "Inspeksi bekisting, tulangan, dan material",
  },
  {
    number: "3",
    title: "Pengecoran",
    description: "Slump test, pemadatan, dokumentasi pelaksanaan",
  },
  {
    number: "4",
    title: "Pasca-Pengecoran",
    description: "Curing, uji mutu, laporan otomatis",
  },
];

export default function Workflow() {
  return (
    <section className="section section-alt" aria-labelledby="workflow-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-subtitle">Alur Kerja</p>
          <h2 className="section-title" id="workflow-heading">
            Tahapan Inspeksi
          </h2>
          <p className="section-description">
            Proses pengawasan pekerjaan beton berbasis Inspection & Test Plan
            (ITP).
          </p>
        </div>
        <div className="workflow-grid">
          {STEPS.map((step) => (
            <div className="workflow-step" key={step.number}>
              <div className="workflow-number" aria-hidden="true">
                {step.number}
              </div>
              <h3 className="workflow-title">{step.title}</h3>
              <p className="workflow-text">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Stats.jsx**

Create `src/components/Stats.jsx`:

```jsx
const STATS = [
  { number: "150+", label: "Proyek Selesai" },
  { number: "15+", label: "Tahun Pengalaman" },
  { number: "50+", label: "Tenaga Ahli" },
  { number: "99%", label: "Tingkat Keberhasilan" },
];

export default function Stats() {
  return (
    <section className="section" aria-labelledby="stats-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-subtitle">Pencapaian</p>
          <h2 className="section-title" id="stats-heading">
            Dalam Angka
          </h2>
        </div>
        <div className="stats-grid">
          {STATS.map((stat, index) => (
            <div className="stat-item" key={index}>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create Footer.jsx**

Create `src/components/Footer.jsx`:

```jsx
import { Link } from "react-router-dom";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div
              className="footer-logo"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <Zap size={20} strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: "var(--font-weight-heading)",
                  fontSize: "1.15rem",
                }}
              >
                COP Civil UPT Malang
              </span>
            </div>
            <p
              style={{
                opacity: 0.75,
                fontSize: "0.9rem",
                maxWidth: "30ch",
                lineHeight: 1.6,
              }}
            >
              Membangun fondasi kuat bagi infrastruktur kelistrikan yang andal
              dan berkelanjutan.
            </p>
          </div>

          <div>
            <h3 className="footer-heading">Navigasi</h3>
            <Link to="/" className="footer-link">
              Home
            </Link>
            <Link to="/panduan" className="footer-link">
              Panduan
            </Link>
            <Link to="/pekerjaan-beton" className="footer-link">
              Pekerjaan Beton
            </Link>
            <Link to="/qna" className="footer-link">
              Q & A
            </Link>
          </div>

          <div>
            <h3 className="footer-heading">Layanan</h3>
            <span className="footer-link">Pekerjaan Beton</span>
            <span className="footer-link">Inspeksi Material</span>
            <span className="footer-link">Digital Inspection</span>
            <span className="footer-link">Pengendalian Mutu</span>
          </div>

          <div>
            <h3 className="footer-heading">Kontak</h3>
            <span
              className="footer-link"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <MapPin
                size={16}
                strokeWidth={2.5}
                style={{ flexShrink: 0, marginTop: 3 }}
              />
              Jl. Basuki Rahmat, Malang, Jawa Timur
            </span>
            <span
              className="footer-link"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Mail size={16} strokeWidth={2.5} />
              copcivil.malang@pln.co.id
            </span>
            <span
              className="footer-link"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Phone size={16} strokeWidth={2.5} />
              (0341) 123-4567
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 PT PLN (Persero) — COP Civil UPT Malang. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Verify all sections render**

Check each section renders with proper styling across all 3 themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/Workflow.jsx src/components/Stats.jsx src/components/Footer.jsx
git commit -m "feat: add Workflow, Stats, and Footer sections"
```

---

### Task 11: Under Construction Page & Home Assembly

**Files:**

- Create: `src/components/UnderConstruction.jsx`, `src/pages/Home.jsx`

- [ ] **Step 1: Create UnderConstruction.jsx**

Create `src/components/UnderConstruction.jsx`:

```jsx
import { Link } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";

export default function UnderConstruction({ title }) {
  return (
    <div className="under-construction">
      <div className="under-construction-icon" aria-hidden="true">
        <Construction size={64} strokeWidth={2} />
      </div>
      <h2>{title}</h2>
      <p>
        Halaman ini sedang dalam pengembangan. Nantikan pembaruan selanjutnya.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={18} strokeWidth={2.5} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create Home.jsx**

Create `src/pages/Home.jsx`:

```jsx
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Workflow from "../components/Workflow";
import Stats from "../components/Stats";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Workflow />
      <Stats />
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify complete landing page**

Full landing page should render with all 6 sections: Hero → About → Services → Workflow → Stats → Footer. Navigation between pages works. Under construction pages display for /panduan, /pekerjaan-beton, /qna.

- [ ] **Step 4: Commit**

```bash
git add src/components/UnderConstruction.jsx src/pages/Home.jsx
git commit -m "feat: add UnderConstruction page and assemble Home landing page"
```

---

### Task 12: Additional Layout CSS for About & Hero

**Files:**

- Modify: `src/styles/layouts.css` (append about and hero-specific layout styles)

- [ ] **Step 1: Add about and hero-accent layout styles**

Append to `src/styles/layouts.css`:

```css
/* --- About Section Layout --- */
.about-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

.about-text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.about-text p {
  font-size: 1.05rem;
  line-height: 1.7;
}

.about-highlights {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about-highlight-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem;
  border: var(--border-width) var(--border-style) var(--color-border);
  background-color: var(--color-card-bg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-speed) var(--transition-easing);
}

.about-highlight-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.about-highlight-item svg {
  color: var(--color-accent);
  flex-shrink: 0;
  margin-top: 2px;
}

.about-highlight-item strong {
  display: block;
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  margin-bottom: 0.25rem;
}

.about-highlight-item p {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* --- Hero Accent Text --- */
.hero-accent {
  color: var(--color-accent);
}

/* --- Hero Decorative Shapes (base) --- */
.hero-shape {
  position: absolute;
  border: var(--border-width) var(--border-style) var(--color-border);
}

.hero-shape-1 {
  width: 120px;
  height: 120px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-accent);
  opacity: 0.15;
}

.hero-shape-2 {
  width: 80px;
  height: 80px;
  top: 20%;
  right: 15%;
  background-color: var(--color-secondary);
  opacity: 0.2;
  transform: rotate(45deg);
}

.hero-shape-3 {
  width: 50px;
  height: 50px;
  bottom: 20%;
  left: 15%;
  background-color: var(--color-muted);
  opacity: 0.3;
  border-radius: var(--radius-circle);
}

@media (min-width: 768px) {
  .about-content {
    grid-template-columns: 1.5fr 1fr;
  }

  .about-highlight-item {
    border-radius: var(--radius-sm);
  }
}
```

- [ ] **Step 2: Verify about section and hero visual renders**

Check that the About section has the two-column layout on desktop, and the hero visual area shows decorative shapes.

- [ ] **Step 3: Commit**

```bash
git add src/styles/layouts.css
git commit -m "feat: add about layout and hero decorative shape styles"
```

---

### Task 13: Polish, Responsive Testing & Final Verification

**Files:**

- Modify: Various files for polish

- [ ] **Step 1: Test all 3 themes end-to-end**

Switch through all 3 themes and verify:

1. **Hand-Drawn**: Wobbly borders, paper dot texture, dashed decorations, Kalam/Patrick Hand fonts
2. **Neo-Brutalism**: Sharp corners, thick 4px borders, halftone dots, Space Grotesk font, uppercase text
3. **Playful Geometric**: Rounded corners, colorful multi-shadow stats, pill buttons, Outfit/Plus Jakarta Sans fonts

- [ ] **Step 2: Test responsive behavior**

Use browser DevTools responsive mode:

1. **Mobile (375px)**: Bottom navbar visible, top navbar simplified, content stacked, theme switcher above bottom nav
2. **Desktop (1024px+)**: Top navbar with all links, no bottom nav, side-by-side hero, 4-column grids

- [ ] **Step 3: Test accessibility**

1. Tab through all interactive elements — verify visible focus indicators
2. Verify skip navigation link works (Tab from top of page)
3. Check heading hierarchy: single h1 per page, h2 for sections, h3 for subsections
4. Verify color contrast with browser DevTools accessibility audit
5. Test with `prefers-reduced-motion` media query (DevTools → Rendering → Emulate)

- [ ] **Step 4: Test navigation**

1. Click all navbar links — verify correct routing
2. Click bottom nav links on mobile
3. Verify Under Construction pages render for /panduan, /pekerjaan-beton, /qna
4. Verify "Kembali ke Beranda" button works

- [ ] **Step 5: Build production check**

```bash
npm run build
```

Expected: Build succeeds with no errors. Output in `dist/` folder.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete PLN COP Civil landing page with 3 theme variants"
```

---

## Self-Review Checklist

| Spec Requirement           | Task    |
| -------------------------- | ------- |
| Vite + React setup         | Task 1  |
| 3 theme token system       | Task 2  |
| CSS reset & typography     | Task 3  |
| Component & layout styles  | Task 4  |
| Theme-specific decorations | Task 5  |
| ThemeContext + persistence | Task 6  |
| Navbar (desktop)           | Task 7  |
| Bottom nav (mobile)        | Task 7  |
| Theme switcher UI          | Task 8  |
| Hero section               | Task 9  |
| About section              | Task 9  |
| Services section           | Task 9  |
| Workflow section           | Task 10 |
| Stats section              | Task 10 |
| Footer                     | Task 10 |
| Under Construction pages   | Task 11 |
| Home page assembly         | Task 11 |
| About/Hero extra layout    | Task 12 |
| Responsive testing         | Task 13 |
| Accessibility (WCAG)       | Task 13 |
| Production build           | Task 13 |
