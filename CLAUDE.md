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

**Component folder layout.** Each React component lives in its own folder under `src/components/<Name>/` containing `index.tsx` + `<Name>.module.css`. Client components: `App/`, `TopBar/`, `BottomNav/`, `CategoryFilters/`, `HomeContent/`, `SearchContent/`, `CartContent/`, `ProductCard/`, `AuthSheet/`, `ProfileView/`, `HistoryView/`, `RecentOrders/`, `PendingOrders/`, `PendingOrderSheet/`. Admin components live under `src/components/admin/<Name>/`: `AdminApp/`, `AdminHeader/`, `AdminNav/`, `OrdersView/`, `OrderCard/`, `ProductsView/`, `ProductEditor/`, `TimeSlotsView/`, `SlotModal/`, `AdminSearch/`, `QRScanner/`, `QRScanFab/`, `ScannedOrderSheet/`. Shared/utility components live under `src/components/shared/`. Cross-component imports use the folder name (`import TopBar from "../TopBar"`), which resolves to `index.tsx`. Imports from `src/store`, `src/data`, etc. are `../../store/...` from inside a component folder. When adding a new component, create the folder + both files; don't drop loose `*.tsx` / `*.module.css` files directly in `src/components/`.

**State is a single `useReducer` + Context.** [src/store/appStore.ts](src/store/appStore.ts) defines `AppState` (active tab, category filter, cart, favorites, notifications, search query, **user**, **authSheetOpen**, **pendingIntent**, **pendingOrders**, **pendingOrderSheetOpen**, **selectedPendingOrderId**), the `AppAction` union, the reducer, and an `AppContext`/`useApp()` hook. `App/index.tsx` creates the reducer and provides the context; every child component reads/writes state via `useApp()` and dispatches actions. `UPDATE_CART_QTY` with `quantity <= 0` removes the item — components rely on this to collapse a stepper back to the empty state without dispatching `REMOVE_FROM_CART` separately. There is no router — tab switching is just `state.activeTab` selecting between `home | search | cart | profile | history`. There is no persistence; state resets on reload.

**Category filter state.** `activeCategory` starts as `''` (empty string = no filter selected, no button highlighted). `SELECT_FILTER` atomically sets `activeTab → "search"` and `activeCategory → <category id>`. `SET_TAB` resets `activeCategory → ''` whenever the new tab is not `"search"` — so navigating away from search always deselects the filter. This means `CategoryFilters` only needs to dispatch `SELECT_FILTER`; no separate `SET_TAB` call is needed.

**Tab-based layout.** `App/index.tsx` renders a fixed `TopBar` + scrollable `main` + `BottomNav` + `AuthSheet` + `PendingOrderSheet`. The active tab determines which content component mounts (`HomeContent`, `SearchContent`, `CartContent`, `ProfileView`, `HistoryView`). `TopBar` renders notifications + user dropdowns and delegates the category filter strip to `CategoryFilters`. `CategoryFilters` returns `null` when `state.activeTab` is `cart`, `profile`, or `history` — keep that list updated if you add new non-product tabs. `BottomNav` only knows about `home`/`search`/`cart`; on `profile`/`history` no nav button is highlighted, and those views provide their own back buttons.

**Anonymous-first auth gate.** The app is fully usable while logged out (browse, favorite, add to cart). Auth is only required for actions like *pay*, *profile*, and *history*. The pattern: a trigger checks `state.user`; if `null` it dispatches `OPEN_AUTH_SHEET` with an `intent` (`"checkout" | "profile" | "login"`), which sets `authSheetOpen = true` and stores `pendingIntent`. `AuthSheet` (slide-up bottom sheet, Google or email+password, mock login) dispatches `LOGIN` on submit. `App/index.tsx` runs a `useEffect` watching `state.user && state.pendingIntent`: when both are set it replays the original flow (e.g. `checkout` → `PLACE_ORDER` + push notification + go home, `profile` → set tab to `profile`) and then dispatches `CLEAR_PENDING_INTENT`. **When adding a new gated action**, follow the same pattern: dispatch `OPEN_AUTH_SHEET` with a new intent, add a branch in App's effect, run the same logic inline when the user is already logged in. `ProfileView` early-returns `null` and dispatches `SET_TAB → home` from a `useEffect` if `state.user` becomes null — never dispatch during render.

**Pending orders flow.** `state.pendingOrders` starts empty — there is no mock data. When the user pays, the caller dispatches `PLACE_ORDER` (exported from `appStore.ts`), which atomically builds a `PendingOrder` from `state.cart` and clears the cart. The action takes `{ id, claimSlot, placedAt }` — generate these with the two exported helpers: `createOrderId()` (produces `"#abc123"` — 3 letters + 3 digits) and `createClaimSlot()` (15-min window starting ~10 min from now, e.g. `"10:30 – 10:45"`). Never dispatch `CLEAR_CART` separately on checkout — `PLACE_ORDER` does it. The full checkout sequence: `dispatch PLACE_ORDER` → `dispatch PUSH_NOTIFICATION` → `dispatch SET_TAB → "home"`. This is done in two places that must stay in sync: the inline path in `CartContent`'s pay button (already-logged-in user) and the post-auth resume branch in `App/index.tsx`'s `useEffect`.

`PendingOrders` renders a "Por recoger" section inside `HomeContent`; it returns `null` when `state.pendingOrders` is empty so it doesn't take up space. Each order card dispatches `OPEN_PENDING_ORDER_SHEET` with the order id. `PendingOrderSheet` is always mounted in `App/index.tsx` alongside `AuthSheet`; it uses the same `mounted`-state + 400ms timeout pattern to avoid leaving the overlay in the DOM. It reads `state.pendingOrders.find(o => o.id === state.selectedPendingOrderId)` and renders a QR code (`qrcode.react`), the claim slot, item list, and total. Also uses `isImageUrl` for product images inside the order summary.

**Modal/overlay rendering pattern.** `AuthSheet` uses a `mounted` state to avoid keeping the overlay in the DOM when closed. Mount immediately on open; unmount after the close animation finishes (timeout slightly longer than the CSS transition — 400ms for a 350ms transition). **Never rely solely on `opacity: 0` to hide a modal** — at ≥768px the sheet is centered in the viewport with `opacity: 0` and no `pointer-events: none`, so it silently blocks all clicks on the page underneath. Conditional rendering is the correct fix:
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => {
  if (open) { setMounted(true); }
  else { const t = setTimeout(() => setMounted(false), 400); return () => clearTimeout(t); }
}, [open]);
if (!mounted) return null;
```

**Cart stepper pattern.** `ProductCard` and HomeContent's recent-orders rows show a `+` button until the product is in the cart, then expose a `−  qty  +` stepper. Both the stepper (`.qtyGroup`) and the initial add button (`.addBtn`) are **always rendered** — neither is mounted/unmounted conditionally. When the product is not in the cart, `.qtyGroup` gets `.qtyGroupHidden` and `.addBtn` gets `.addBtnHidden` (both use `visibility: hidden; opacity: 0; pointer-events: none` + `tabIndex={-1}`). This reserves space for both so the layout never shifts when adding the first unit. Inside `.info` the order is: name → desc → qtyGroup (`margin-top: auto`, centered) → priceRow (discount + price + addBtn). Both stepper buttons read `state.cart.find(i => i.product.id === product.id)`; the `−` uses `UPDATE_CART_QTY` with `cartItem.quantity - 1` and relies on the reducer's `<= 0` removal to restore the original state.

**Mobile touch targets.** Any button that is tapped frequently on mobile (steppers, reorder buttons, etc.) must have a minimum 44×44 px tap area. Keep the visual size tight; expand the hit area invisibly with a `::after` pseudo-element:
```css
.qtyBtn { position: relative; }
.qtyBtn::after {
  content: '';
  position: absolute;
  inset: -10px;   /* 24px visual + 20px = 44px tap target */
}
@media (min-width: 768px) {
  .qtyBtn::after { display: none; }   /* mouse users don't need it */
}
```
Currently applied to: `ProductCard .qtyBtn` (inset -10px), `CartContent .qtyBtn` (inset -8px), `RecentOrders .reorderQtyBtn/.reorderBtn` (inset -7px/-6px). **Important:** for this to work on `ProductCard`, `overflow: hidden` must be on `.imageArea` (with `border-radius: var(--radius-md) var(--radius-md) 0 0`), NOT on `.card` — otherwise the `::after` pseudo-elements get clipped by the card bounds.

**Cart sticky summary (mobile).** On `< 768px`, `CartContent`'s `.summary` is `position: sticky; bottom: 8px` so the pay block hovers above the items list. The component also tracks an `atEnd` state via a scroll listener on the cart's scroll parent (walks up looking for `overflow-y: auto`) and toggles a `.summaryAtEnd` class on the summary when the user reaches the bottom. While not at end, the `Productos (n)` row is collapsed (`max-height: 0; opacity: 0`) and `.summaryTotal`'s top divider is transparent + zero padding; both animate in once `.summaryAtEnd` is set. At ≥768px these mobile-only states are reset and the divider/row are always visible. The desktop ≥1024px sticky-aside override comes after, so source order matters.

**Product images (`Product.image`).** The field is a single string that holds **either** an emoji (e.g. `"🥖"`) **or** a URL pointing to a file in `public/` (e.g. `"/tortilla.jpg"`) or an external URL (`"https://..."`). The helper [`isImageUrl(image)`](src/data/mockData.ts) in `mockData.ts` (`image.startsWith("/") || image.startsWith("http")`) is the discriminator. **Every render site that displays `Product.image` must branch on `isImageUrl` and render either an `<img>` (with `alt={product.name}` and `loading="lazy"`) or a `<span class={emojiClass}>`** — currently: `ProductCard` (`.image` fills `.imageArea` with `object-fit: cover`), `CartContent` (`.itemImage` 44×44 thumb), `HomeContent` recent-orders rows (`.orderItemImage` 28×28), and `HistoryView` (`.itemImage` 26×26). The emoji span variants set fixed widths so a row mixing emojis and images doesn't shift horizontally. To add a real image: drop the file in `public/` and set `image: "/myfile.jpg"` — no other changes needed.

**Product DTO (`Product` interface in `mockData.ts`).** Key fields:
- `categories: string[]` — array of category ids (e.g. `["bocadillos", "healthy"]`). Replaced the old `category: string` single value. Every filter site must use `.includes()` / `.some()` instead of `===`. `ProductEditor` renders category chips (multi-select, same chip pattern as allergens).
- `requiresPreparation?: boolean` — marks products that need active kitchen work (bocadillos, coffees, etc.). The `ProductEditor` has a dedicated full-width toggle button for this. In `adminMockData.ts`, `AdminOrder.needsPrep` is derived automatically from `items.some(i => i.product.requiresPreparation === true)` — **never set `needsPrep` manually** in `order()` calls.

**Styling: CSS Modules + global tokens.** Design tokens (colors, radii, shadows, `--topbar-height`, `--bottomnav-height`, `--sidebar-width`, `--content-max-width`) live in [src/styles/global.css](src/styles/global.css). Each component folder has its co-located `<Name>.module.css`. Do NOT introduce Tailwind, CSS-in-JS, or other styling systems — match the existing CSS Module pattern.

**Background pattern (global.css / Layout.astro).** The food SVG pattern (`public/i-like-food.svg`) is rendered via CSS `mask-image` on `body::before`. The stacking setup: `html { background-color: var(--color-bg) }` provides the cream canvas; `body { isolation: isolate }` creates a scoped stacking context; `body::before { position: fixed; inset: 0; z-index: -1; background-color: var(--bg-pattern-color); mask-image: var(--bg-pattern-image); opacity: var(--bg-pattern-opacity) }` renders the pattern above body's transparent background but below body's content; `.app { background: transparent }` lets the pattern show through the content area. All tunable values (`--bg-pattern-image`, `--bg-pattern-size`, `--bg-pattern-repeat`, `--bg-pattern-color`, `--bg-pattern-opacity`) are CSS variables in `:root`. **Why `isolation: isolate` is required:** without it, `body::before { z-index: -1 }` escapes to the root stacking context and renders behind `html`'s background, making the pattern invisible.

**TopBar padding alignment.** `TopBar.module.css` sets `--padding-x-inner-elements` on `.header` at 768px/1024px (same clamp values as non-scroll content components). `CategoryFilters` inherits the variable via the cascade and uses `padding-inline: var(--padding-x-inner-elements)` at tablet/desktop — no need to redeclare the clamp values inside CategoryFilters.module.css.

**Responsive breakpoints** (important — the app must work on phone, tablet, and PC):
- **< 768px** — mobile: full-width app card, fixed bottom nav.
- **≥ 768px** — tablet: app spans full viewport with side borders + soft shadow (no max-width cap); bottom nav aligned to the card; `HomeContent` horizontal scroll rows become wrap grids.
- **≥ 1024px** — desktop: app fills viewport width, no border/shadow; `BottomNav` transforms into **floating action buttons** stacked in the bottom-right (circular FABs, labels hidden, `.main` gets ~120px bottom padding so FABs don't overlap content); `CartContent` becomes a two-column layout (items + sticky summary aside).

**Padding-inline convention.** `App.module.css` only sets `padding-block` on `.main > *` — horizontal padding is the responsibility of each tab's own `.content`. The gutter is managed via a CSS custom property `--padding-x-inner-elements` declared on `.content` and inherited by children. There are two subpatterns:

- **Components WITH `.horizontalScroll`** (e.g. `HomeContent`): `.content` must NOT have `padding-inline` — it would break the full-bleed scroll. Children set `padding: 0 20px` in mobile and inherit `--padding-x-inner-elements` in tablet/desktop. The variable is `clamp(2rem, 10vw, 8rem)` at ≥768px and `clamp(2rem, 20vw, 25rem)` at ≥1024px.
- **Components WITHOUT `.horizontalScroll`** (e.g. `SearchContent`, `CartContent`, `ProfileView`, `HistoryView`): `.content` uses `padding-inline: 20px` in mobile and `padding-inline: var(--padding-x-inner-elements)` in tablet/desktop. The variable is `clamp(2rem, 6vw, 5rem)` at ≥768px and `clamp(2rem, 20vw, 25rem)` at ≥1024px.

**Flex `min-width: 0` gotcha.** Any flex item that contains a horizontal scroll (or any scrollable child with `flex-shrink: 0` cards) **must** set `min-width: 0`, otherwise the default `min-width: auto` lets the children's intrinsic min-content push the flex item wider than the viewport. Combined with `body { overflow: hidden }` from `global.css`, this clips section titles and cards at the right edge. This bit `HomeContent .section` once already — keep `min-width: 0` on any new section containing `.horizontalScroll`.

**Horizontal scroll padding.** `.horizontalScroll` needs vertical padding ≥ 14px top / 20px bottom so card shadows (`--shadow-md`) and `:hover { transform: translateY(-2px) }` don't get clipped by the `overflow-x: auto` viewport. Pair with `scroll-padding-inline: 20px` so snap stops respect the gutter.

**CSS Module cascade gotcha — media queries at the end.** All `@media` blocks must be grouped at the bottom of the file, after every base rule. The required structure is: (1) all base selectors, (2) one `@media (min-width: 768px) { … }` block with all tablet overrides, (3) one `@media (min-width: 1024px) { … }` block with all desktop overrides. Never intercalate queries between base rules — media queries don't add specificity so source order is the only tiebreaker, and mixing them makes overrides unpredictable. This bit `BottomNav` active-pill styles and several other components.

**SVG icon colors.** Icons use `stroke="currentColor"` / `fill="currentColor"` so color is driven by the parent CSS class. Set the color on the wrapping button/element (e.g. `.avatar { color: var(--color-white) }`), never hard-code `stroke="white"` or inline `var(--color-...)` in JSX. The fallback variable `--color-gray-50` does **not** exist in `global.css` — use `--color-surface` for very light backgrounds.

**Mobile viewport height.** Always use `dvh` (dynamic viewport height) instead of `vh` for full-screen height declarations — `height: 100dvh`, `max-height: 92dvh`, etc. `dvh` resizes as the browser chrome (address bar, tab strip) slides in/out on mobile; `vh` is fixed to the largest possible viewport and causes layout overflow or clipping on iOS Safari / Chrome Android.

**Input font-size — prevent iOS auto-zoom.** Every `<input>`, `<textarea>`, and `<select>` element **must** have `font-size: 16px` or larger in its CSS class. iOS Safari zooms the viewport whenever a focusable field has `font-size < 16px`, which breaks the layout. Do not use `14px` or `15px` on form fields even if the surrounding UI uses smaller type — the minimum is `16px`.

**Admin platform.** A separate Astro page at `/admin` mounts `AdminApp` as a React island. State lives in `src/store/adminStore.ts` (`AdminState` / `AdminAction` / `useAdmin()`). Mock data is split: `src/data/mockData.ts` (shared `Product` type + products array) and `src/data/adminMockData.ts` (admin users, time slots, orders, notifications). Key admin conventions:

- **`QRScanFab`** (`src/components/admin/QRScanFab/`) — reusable self-contained component that encapsulates the QR scanner FAB button, `QRScanner` modal, and `ScannedOrderSheet`. Mount it at the root of any admin view that needs QR lookup; currently used in `AdminSearch` and `OrdersView`.
- **`OrdersView` filters** — `state.orderFilter` is `"all" | "pending" | "needs-prep" | "current-slot"`. The `"current-slot"` filter calls `getCurrentSlotId(state.timeSlots)` (compares `new Date()` against each slot's `startTime`/`endTime` in `"HH:MM"` format) and shows only that one slot group. The active slot is marked with a green blinking dot (`.liveDot` CSS animation). All slot groups are always rendered — empty ones show a dashed placeholder instead of disappearing.
- **`AdminOrder.needsPrep`** is computed from `items.some(i => i.product.requiresPreparation === true)` inside the `order()` helper — never passed manually.

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
