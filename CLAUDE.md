# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Client-side prototype for the **IES Pío Baroja** school cafeteria ordering app. Astro static site that mounts a single React island; all data is mocked in [src/data/mockData.ts](src/data/mockData.ts) — there is no backend yet.

Requires Node ≥ 22.12.0, package manager is **pnpm**.

## Commands

| Command | Action |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Dev server at `localhost:4321` |
| `pnpm build` | Build static site to `./dist/` |
| `pnpm preview` | Preview the production build |
| `pnpm astro check` | Type-check Astro + TS |

No test runner, linter, or formatter is configured.

# Frontend Guidelines

Al generar interfaces:
- Elige una dirección estética clara y comprométete con ella
- Tipografía distintiva (evita Arial, Inter, Roboto, system fonts)
- Paleta cohesiva con color dominante y acento fuerte
- Animaciones con intención: carga, hover, micro-interacciones
- Layouts inesperados: asimetría, overlap, espacio negativo generoso
- Evita estéticas genéricas de IA (gradientes púrpura, patrones predecibles)

## Stack del proyecto
- React, Astro, CSS puro.

## Architecture

**Astro shell, single React island.** [src/pages/index.astro](src/pages/index.astro) renders [src/layouts/Layout.astro](src/layouts/Layout.astro) and mounts [src/components/App.tsx](src/components/App.tsx) with `client:load`. Everything interactive lives inside that one React tree — Astro is only used as the build/host. Adding new pages means either more islands or more routes under `src/pages/`.

**State is a single `useReducer` + Context.** [src/store/appStore.ts](src/store/appStore.ts) defines `AppState` (active tab, category filter, cart, favorites, notifications, search query), the `AppAction` union, the reducer, and an `AppContext`/`useApp()` hook. `App.tsx` creates the reducer and provides the context; every child component reads/writes state via `useApp()` and dispatches actions. There is no router — tab switching is just `state.activeTab` selecting between `HomeContent`, `SearchContent`, and `CartContent`. There is no persistence; state resets on reload.

**Tab-based layout.** `App.tsx` renders a fixed `TopBar` + scrollable `main` + `BottomNav`. The active tab determines which content component mounts. `TopBar` also owns the category filters (which dispatch `SET_CATEGORY`) and the notifications/user dropdowns.

**Styling: CSS Modules + global tokens.** Design tokens (colors, radii, shadows, `--topbar-height`, `--bottomnav-height`, `--sidebar-width`, `--content-max-width`) live in [src/styles/global.css](src/styles/global.css). Each component has a co-located `*.module.css`. Do NOT introduce Tailwind, CSS-in-JS, or other styling systems — match the existing CSS Module pattern.

**Responsive breakpoints** (important — the app must work on phone, tablet, and PC):
- **< 768px** — mobile: full-width app card, fixed bottom nav.
- **≥ 768px** — tablet: app spans full viewport with side borders + soft shadow (no max-width cap); bottom nav aligned to the card; `HomeContent` horizontal scroll rows become wrap grids.
- **≥ 1024px** — desktop: app fills viewport width, no border/shadow; `BottomNav` transforms into **floating action buttons** stacked in the bottom-right (circular FABs, labels hidden, `.main` gets ~120px bottom padding so FABs don't overlap content); `CartContent` becomes a two-column layout (items + sticky summary aside).

**Padding-inline convention.** `App.module.css` only sets `padding-block` on `.main > *` — horizontal padding is the responsibility of each tab's own `.content`. Use this pattern consistently:
```css
.content { padding-inline: 20px; }
@media (min-width: 768px) {
  .content { padding-inline: clamp(2rem, 6vw, 5rem); }
}
```
HomeContent's section-level blocks (`.sectionHeader`, `.horizontalScroll`, `.ordersList`, `.emptyState`) each set their own `padding-inline: 20px` so the horizontal scroll can bleed full-width while titles stay aligned.

**Flex `min-width: 0` gotcha.** Any flex item that contains a horizontal scroll (or any scrollable child with `flex-shrink: 0` cards) **must** set `min-width: 0`, otherwise the default `min-width: auto` lets the children's intrinsic min-content push the flex item wider than the viewport. Combined with `body { overflow: hidden }` from `global.css`, this clips section titles and cards at the right edge. This bit `HomeContent .section` once already — keep `min-width: 0` on any new section containing `.horizontalScroll`.

**Horizontal scroll padding.** `.horizontalScroll` needs vertical padding ≥ 14px top / 20px bottom so card shadows (`--shadow-md`) and `:hover { transform: translateY(-2px) }` don't get clipped by the `overflow-x: auto` viewport. Pair with `scroll-padding-inline: 20px` so snap stops respect the gutter.

**CSS Module cascade gotcha.** Media queries don't add specificity — source order decides. When adding a desktop override for a class, put the `@media` block *after* all base rules for that class, otherwise later base rules will clobber your override. This bit the `BottomNav` active-pill styles once already.

**SVG icon colors.** Icons use `stroke="currentColor"` / `fill="currentColor"` so color is driven by the parent CSS class. Set the color on the wrapping button/element (e.g. `.avatar { color: var(--color-white) }`), never hard-code `stroke="white"` or inline `var(--color-...)` in JSX. The fallback variable `--color-gray-50` does **not** exist in `global.css` — use `--color-surface` for very light backgrounds.

## Language

UI copy is in **Spanish** (Recomendados, Favoritos, Carrito, Buscar, etc.). Match that when adding user-facing strings.

## Available Skills & Slash Commands

**Project slash commands** (`.claude/commands/`):
- **/check-design** `<componente>` — Audita un componente contra los 6 criterios del proyecto (tokens, breakpoints, cascade, currentColor, estética, CSS Module).
- **/new-component** `<nombre>` — Genera un componente React + CSS Module siguiendo las convenciones del proyecto.
- **/new-page-astro** `<nombre>` — Genera una página `.astro` estática usando `Layout.astro` y `mockData.ts`.

**Global skills**:
- **frontend-design** — Genera interfaces distintivas y producción-grade que evitan estéticas genéricas de IA.
- **simplify** — Revisa código modificado por reuso, calidad y eficiencia, y arregla problemas.
- **update-config** — Configura el harness de Claude Code vía `settings.json` (hooks para comportamientos automáticos).
- **keybindings-help** — Personaliza atajos de teclado en `~/.claude/keybindings.json`.
- **loop** — Ejecuta un prompt o comando en intervalos recurrentes (`/loop 5m /foo`).
- **schedule** — Crea/lista/ejecuta agentes remotos programados (triggers tipo cron).
- **claude-api** — Construye apps contra Claude API / Anthropic SDK / Agent SDK.
