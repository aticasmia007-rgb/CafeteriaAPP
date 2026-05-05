Crea un nuevo componente React para la cafetería IES Pío Baroja.

Componente: $ARGUMENTS

## Requisitos técnicos
- React + TypeScript
- CSS Module co-localizado (`<Nombre>.module.css`), NO Tailwind ni CSS-in-JS
- Usa los tokens de `src/styles/global.css` (colores, radios, sombras, `--topbar-height`, etc.)
- Lee/escribe estado global con `useApp()` desde `src/store/appStore.ts`
- UI copy en **español**

## Estado global disponible (`AppState`)
Campos relevantes:
- `cart` — items en carrito; `UPDATE_CART_QTY` con `quantity ≤ 0` elimina el item
- `pendingOrders` — pedidos realizados (empieza vacío, se llena con `PLACE_ORDER`)
- `pendingOrderSheetOpen` / `selectedPendingOrderId` — controlan el sheet de detalle de pedido
- `authSheetOpen` / `pendingIntent` — controlan el sheet de login
- `user` — null si no autenticado

## Available components utilitary compounents
- Components that are utilitys and used to prevent repetitive code.
- in `src/components/shared/**`


### Flujo de pago (`PLACE_ORDER`)
Para registrar un pedido al pagar, **NO** uses `CLEAR_CART` separado — usa `PLACE_ORDER` que construye el pedido desde el carrito y lo vacía en un solo dispatch:
```tsx
import { createClaimSlot, createOrderId } from "../../store/appStore";

dispatch({ type: "PLACE_ORDER", id: createOrderId(), claimSlot: createClaimSlot(), placedAt: "Ahora" });
dispatch({ type: "PUSH_NOTIFICATION", notification: { id: Date.now(), title: "Pedido realizado", message: `...`, time: "Ahora", read: false } });
dispatch({ type: "SET_TAB", tab: "home" });
```

## Responsive obligatorio (3 breakpoints)
- `< 768px` móvil: full-width
- `≥ 768px` tablet: grid/wrap en lugar de scroll horizontal
- `≥ 1024px` desktop: ajusta si aplica layout multi-columna

## Convenciones del proyecto (no negociables)

### Organización del CSS: media queries AL FINAL
Todos los selectores base primero, luego un único bloque `@media (min-width: 768px)` y otro `@media (min-width: 1024px)` al final. NUNCA intercalar queries entre reglas base.
```css
/* ✅ correcto */
.foo { ... }
.bar { ... }
@media (min-width: 768px) { .foo { ... } .bar { ... } }
@media (min-width: 1024px) { .foo { ... } }
```

### Padding-inline en tab-components (`.content`)
Hay dos subpatrones según si el componente tiene `.horizontalScroll` o no:

**CON `.horizontalScroll`** (ej. `HomeContent`): `.content` NUNCA lleva `padding-inline` — lo rompe. Los hijos fijan el gutter individualmente en móvil y heredan `--padding-x-inner-elements` en tablet/desktop:
```css
/* base: hijos con padding: 0 20px */
@media (min-width: 768px) {
  .content { --padding-x-inner-elements: clamp(2rem, 10vw, 8rem); }
  .sectionHeader { padding: 0 var(--padding-x-inner-elements); }
  .horizontalScroll { padding: 14px var(--padding-x-inner-elements) 20px; }
  .ordersList, .emptyState { padding: 0 var(--padding-x-inner-elements); }
}
@media (min-width: 1024px) {
  .content {
    --padding-x-inner-elements: clamp(2rem, 20vw, 25rem);
    padding: 24px 0 32px;
    gap: 32px;
  }
}
```

**SIN `.horizontalScroll`** (ej. `SearchContent`, `CartContent`, `ProfileView`, `HistoryView`): `.content` lleva `padding-inline` directamente:
```css
.content { padding-inline: 20px; }
@media (min-width: 768px) {
  .content {
    --padding-x-inner-elements: clamp(2rem, 6vw, 5rem);
    padding-inline: var(--padding-x-inner-elements);
  }
}
@media (min-width: 1024px) {
  .content {
    --padding-x-inner-elements: clamp(2rem, 20vw, 25rem);
    padding-inline: var(--padding-x-inner-elements);
  }
}
```

NO añadas padding lateral en `.main > *` — `App.module.css` solo provee `padding-block`.

### Flex `min-width: 0`
Cualquier `.section` o flex item que contenga un `.horizontalScroll` (cards con `flex-shrink: 0`) DEBE tener `min-width: 0`. Sin esto, el contenido empuja el layout más ancho que el viewport y `body { overflow: hidden }` recorta los títulos.

### Scroll horizontal con cards
```css
.horizontalScroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 14px 20px 20px;          /* vertical para sombra+hover, lateral = gutter */
  scroll-padding-inline: 20px;       /* snap respeta el gutter */
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.horizontalScroll::-webkit-scrollbar { display: none; }
/* ≥ 768px → convierte a grid */
@media (min-width: 768px) {
  .horizontalScroll {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    overflow-x: visible;
    padding: 14px var(--padding-x-inner-elements) 20px;
  }
}
```

### Iconos SVG
SIEMPRE `stroke="currentColor"` / `fill="currentColor"`. El color va en la clase CSS del padre:
```tsx
<button className={styles.iconBtn}>
  <svg stroke="currentColor" .../>
</button>
```
```css
.iconBtn { color: var(--color-gray-700); }
```

### Visibilidad sin layout shift
Para elementos que se muestran/ocultan pero deben conservar su espacio (ej. botón `+` que da paso a un stepper), usa el patrón `visibility: hidden` en lugar de montaje/desmontaje condicional:
```css
.btnHidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}
```
```tsx
<button
  className={`${styles.btn} ${isHidden ? styles.btnHidden : ""}`}
  tabIndex={isHidden ? -1 : 0}
/>
```

### Variable inexistente
`--color-gray-50` NO existe — usa `--color-surface` para fondos muy claros.

### Viewport height
Usa siempre `dvh` en lugar de `vh` para alturas de pantalla completa — `height: 100dvh`, `max-height: 92dvh`, etc. `dvh` se adapta al chrome dinámico del navegador móvil (barra de URL, barra de pestañas).

### Inputs: font-size mínimo 16px
Todo `<input>`, `<textarea>` y `<select>` debe tener `font-size: 16px` o mayor en su clase CSS. iOS Safari hace auto-zoom si el campo enfocado tiene `font-size < 16px`, rompiendo el layout.

### Targets táctiles en móvil
Botones de interacción frecuente (steppers, reordenar, FABs) deben tener área de toque ≥44×44px en móvil. Mantén el visual compacto y expande el hit area con un pseudo-elemento invisible:
```css
.btn { position: relative; }
.btn::after {
  content: '';
  position: absolute;
  inset: -10px;  /* ajustar según tamaño visual: 24px + 20px = 44px */
}
@media (min-width: 768px) {
  .btn::after { display: none; }
}
```
**Nota:** si el componente padre tiene `overflow: hidden` (ej. una card con imagen), mueve ese `overflow: hidden` al contenedor de la imagen (con `border-radius` solo en las esquinas superiores), no a la card raíz — de lo contrario el `::after` queda recortado.

### Modales y overlays — renderizado condicional
Nunca dejes un modal/sheet en el DOM con solo `opacity: 0`. En ≥768px un sheet centrado en viewport con `opacity: 0` bloquea todos los clics aunque sea invisible. Usa un `mounted` state con timeout para preservar la animación de cierre:
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => {
  if (open) { setMounted(true); }
  else { const t = setTimeout(() => setMounted(false), 400); return () => clearTimeout(t); }
}, [open]);
if (!mounted) return null;
```

## Estética
- Tipografía: `var(--font-display)` (Fraunces serif italic) para títulos, `var(--font-family)` (DM Sans) para UI
- Paleta cálida: verde oliva `--color-primary` + terracota `--color-accent` + cream `--color-bg`/`--color-surface`
- Animaciones sutiles con CSS puro (fade, hover, transición de 0.15-0.2s)
- Sin gradientes púrpura, sin Inter/Roboto, sin patrones genéricos de IA

## Componentes existentes como referencia

**Cliente:** `App/`, `TopBar/`, `BottomNav/`, `CategoryFilters/`, `HomeContent/`, `SearchContent/`, `CartContent/`, `ProductCard/`, `AuthSheet/`, `ProfileView/`, `HistoryView/`, `RecentOrders/`, `PendingOrders/`, `PendingOrderSheet/`

**Admin** (`src/components/admin/`): `AdminApp/`, `AdminHeader/`, `AdminNav/`, `OrdersView/`, `OrderCard/`, `ProductsView/`, `ProductEditor/`, `TimeSlotsView/`, `SlotModal/`, `AdminSearch/`, `QRScanner/`, `QRScanFab/`, `ScannedOrderSheet/`

**Compartidos** (`src/components/shared/`): componentes utilitarios reutilizables entre cliente y admin.

### Imágenes de producto (`isImageUrl`)
Cualquier componente que muestre `Product.image` debe importar `isImageUrl` de `src/data/mockData` y ramificar entre `<img>` y `<span>` emoji. Esto incluye sheets de detalle de pedidos (`PendingOrderSheet`) y cualquier listado de items.

### `Product.categories` — array, no string
El campo es `categories: string[]` (puede pertenecer a varias categorías). Para filtrar usa `.includes(id)`. Para mostrar chips usa `.map()`. El campo anterior `category: string` ya no existe.

### `Product.requiresPreparation` — toggle en editor
`requiresPreparation?: boolean` indica si el producto necesita preparación en cocina. En `ProductEditor` se controla con un toggle button (`.prepToggle`/`.prepToggleActive`). Se guarda como `true` o `undefined` (nunca `false` explícito). En el admin, `AdminOrder.needsPrep` se deriva automáticamente — no lo calcules tú.

### `QRScanFab` — componente reutilizable
Si la vista admin necesita escáner QR, usa `<QRScanFab />` de `src/components/admin/QRScanFab/`. Encapsula el FAB, el modal de cámara (`QRScanner`) y el sheet de resultado (`ScannedOrderSheet`). No reimplementes esta lógica inline.
