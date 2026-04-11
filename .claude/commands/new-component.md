Crea un nuevo componente React para la cafetería IES Pío Baroja.

Componente: $ARGUMENTS

## Requisitos técnicos
- React + TypeScript
- CSS Module co-localizado (`<Nombre>.module.css`), NO Tailwind ni CSS-in-JS
- Usa los tokens de `src/styles/global.css` (colores, radios, sombras, `--topbar-height`, etc.)
- Lee/escribe estado global con `useApp()` desde `src/store/appStore.ts`
- UI copy en **español**

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

## Estética
- Tipografía: `var(--font-display)` (Fraunces serif italic) para títulos, `var(--font-family)` (DM Sans) para UI
- Paleta cálida: verde oliva `--color-primary` + terracota `--color-accent` + cream `--color-bg`/`--color-surface`
- Animaciones sutiles con CSS puro (fade, hover, transición de 0.15-0.2s)
- Sin gradientes púrpura, sin Inter/Roboto, sin patrones genéricos de IA
