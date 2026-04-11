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

**Astro shell, single React island.** [src/pages/index.astro](src/pages/index.astro) renders [src/layouts/Layout.astro](src/layouts/Layout.astro) and mounts [src/components/App/index.tsx](src/components/App/index.tsx) with `client:load`. Everything interactive lives inside that one React tree — Astro is only used as the build/host. Adding new pages means either more islands or more routes under `src/pages/`.

**Component folder layout.** Each React component lives in its own folder under `src/components/<Name>/` containing `index.tsx` + `<Name>.module.css` (e.g. `App/`, `TopBar/`, `BottomNav/`, `HomeContent/`, `SearchContent/`, `CartContent/`, `ProductCard/`, `AuthSheet/`, `ProfileView/`, `HistoryView/`). Cross-component imports use the folder name (`import TopBar from "../TopBar"`), which resolves to `index.tsx`. Imports from `src/store`, `src/data`, etc. are `../../store/...` from inside a component folder. When adding a new component, create the folder + both files; don't drop loose `*.tsx` / `*.module.css` files directly in `src/components/`.

**State is a single `useReducer` + Context.** [src/store/appStore.ts](src/store/appStore.ts) defines `AppState` (active tab, category filter, cart, favorites, notifications, search query, **user**, **authSheetOpen**, **pendingIntent**), the `AppAction` union, the reducer, and an `AppContext`/`useApp()` hook. `App/index.tsx` creates the reducer and provides the context; every child component reads/writes state via `useApp()` and dispatches actions. `UPDATE_CART_QTY` with `quantity <= 0` removes the item — components rely on this to collapse a stepper back to the empty state without dispatching `REMOVE_FROM_CART` separately. There is no router — tab switching is just `state.activeTab` selecting between `home | search | cart | profile | history`. There is no persistence; state resets on reload.

**Tab-based layout.** `App/index.tsx` renders a fixed `TopBar` + scrollable `main` + `BottomNav` + `AuthSheet`. The active tab determines which content component mounts (`HomeContent`, `SearchContent`, `CartContent`, `ProfileView`, `HistoryView`). `TopBar` also owns the category filters (which dispatch `SET_CATEGORY`) and the notifications/user dropdowns. The category filter row in `TopBar` is hidden when `state.activeTab` is `cart`, `profile`, or `history` — keep that list updated if you add new non-product tabs. `BottomNav` only knows about `home`/`search`/`cart`; on `profile`/`history` no nav button is highlighted, and those views provide their own back buttons.

**Anonymous-first auth gate.** The app is fully usable while logged out (browse, favorite, add to cart). Auth is only required for actions like *pay*, *profile*, and *history*. The pattern: a trigger checks `state.user`; if `null` it dispatches `OPEN_AUTH_SHEET` with an `intent` (`"checkout" | "profile" | "login"`), which sets `authSheetOpen = true` and stores `pendingIntent`. `AuthSheet` (slide-up bottom sheet, Google or email+password, mock login) dispatches `LOGIN` on submit. `App/index.tsx` runs a `useEffect` watching `state.user && state.pendingIntent`: when both are set it replays the original flow (e.g. `checkout` → push notification + clear cart + go home, `profile` → set tab to `profile`) and then dispatches `CLEAR_PENDING_INTENT`. **When adding a new gated action**, follow the same pattern: dispatch `OPEN_AUTH_SHEET` with a new intent, add a branch in App's effect, run the same logic inline when the user is already logged in. `ProfileView` early-returns `null` and dispatches `SET_TAB → home` from a `useEffect` if `state.user` becomes null — never dispatch during render.

**Cart stepper pattern.** `ProductCard` and HomeContent's recent-orders rows show a `+` button until the product is in the cart, then expose a `−  qty  +` stepper. `ProductCard`'s stepper is **always rendered** and gets `.qtyGroupHidden` (`visibility: hidden; opacity: 0; pointer-events: none` + `tabIndex={-1}` on its buttons) when the product isn't in the cart — this reserves its space so adding the first unit doesn't shift the layout. Inside `.info` the order is: name → desc → qtyGroup (`margin-top: auto`, centered) → priceRow (the absolute bottom of the card, holding discount + price + initial `+`). Both stepper buttons read `state.cart.find(i => i.product.id === product.id)`; the `−` uses `UPDATE_CART_QTY` with `cartItem.quantity - 1` and relies on the reducer's `<= 0` removal to restore the original state.

**Cart sticky summary (mobile).** On `< 768px`, `CartContent`'s `.summary` is `position: sticky; bottom: 8px` so the pay block hovers above the items list. The component also tracks an `atEnd` state via a scroll listener on the cart's scroll parent (walks up looking for `overflow-y: auto`) and toggles a `.summaryAtEnd` class on the summary when the user reaches the bottom. While not at end, the `Productos (n)` row is collapsed (`max-height: 0; opacity: 0`) and `.summaryTotal`'s top divider is transparent + zero padding; both animate in once `.summaryAtEnd` is set. At ≥768px these mobile-only states are reset and the divider/row are always visible. The desktop ≥1024px sticky-aside override comes after, so source order matters.

**Product images (`Product.image`).** The field is a single string that holds **either** an emoji (e.g. `"🥖"`) **or** a URL pointing to a file in `public/` (e.g. `"/tortilla.jpg"`) or an external URL (`"https://..."`). The helper [`isImageUrl(image)`](src/data/mockData.ts) in `mockData.ts` (`image.startsWith("/") || image.startsWith("http")`) is the discriminator. **Every render site that displays `Product.image` must branch on `isImageUrl` and render either an `<img>` (with `alt={product.name}` and `loading="lazy"`) or a `<span class={emojiClass}>`** — currently: `ProductCard` (`.image` fills `.imageArea` with `object-fit: cover`), `CartContent` (`.itemImage` 44×44 thumb), `HomeContent` recent-orders rows (`.orderItemImage` 28×28), and `HistoryView` (`.itemImage` 26×26). The emoji span variants set fixed widths so a row mixing emojis and images doesn't shift horizontally. To add a real image: drop the file in `public/` and set `image: "/myfile.jpg"` — no other changes needed.

**Styling: CSS Modules + global tokens.** Design tokens (colors, radii, shadows, `--topbar-height`, `--bottomnav-height`, `--sidebar-width`, `--content-max-width`) live in [src/styles/global.css](src/styles/global.css). Each component folder has its co-located `<Name>.module.css`. Do NOT introduce Tailwind, CSS-in-JS, or other styling systems — match the existing CSS Module pattern.

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
