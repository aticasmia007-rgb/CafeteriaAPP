Crea un nuevo componente React para la cafetería IES Pío Baroja.

Componente: $ARGUMENTS

## Requisitos técnicos
- React + TypeScript
- CSS Module co-localizado (`*.module.css`), NO Tailwind ni CSS-in-JS
- Usa los tokens de `src/styles/global.css` (colores, radios, sombras, `--topbar-height`, etc.)
- Lee/escribe estado global con `useApp()` desde `src/store/appStore.ts`
- UI copy en **español**

## Responsive obligatorio (3 breakpoints)
- `< 768px` móvil: full-width
- `≥ 768px` tablet: grid/wrap en lugar de scroll horizontal
- `≥ 1024px` desktop: ajusta si aplica layout multi-columna

## Convenciones del proyecto (no negociables)

**Padding-inline en contenedores top-level (`.content`)**:
```css
.content {
  padding-inline: 20px;
  min-width: 0;
}
@media (min-width: 768px) {
  .content { padding-inline: clamp(2rem, 6vw, 5rem); }
}
```
NO añadas padding lateral en `.main > *` — `App.module.css` solo provee `padding-block`.

**Flex `min-width: 0`**: cualquier `.section` o flex item que contenga un scroll horizontal (cards con `flex-shrink: 0`) DEBE tener `min-width: 0`. Sin esto, el contenido empuja el layout más ancho que el viewport y `body { overflow: hidden }` recorta los títulos.

**Scroll horizontal con cards**:
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
```

**Iconos SVG**: SIEMPRE `stroke="currentColor"` / `fill="currentColor"`. El color va en la clase CSS del padre:
```tsx
<button className={styles.iconBtn}>
  <svg stroke="currentColor" .../>
</button>
```
```css
.iconBtn { color: var(--color-gray-700); }
```

**Cascade gotcha**: media queries DESPUÉS de las reglas base de la misma clase.

**Variable inexistente**: `--color-gray-50` NO existe — usa `--color-surface`.

## Estética
- Tipografía distintiva: `var(--font-display)` (Fraunces serif italic) para títulos, `var(--font-family)` (DM Sans) para UI
- Paleta cálida: verde oliva `--color-primary` + terracota `--color-accent` + cream `--color-bg`/`--color-surface`
- Animaciones sutiles con CSS puro (fade, hover, transición de 0.15-0.2s)
- Sin gradientes púrpura, sin Inter/Roboto, sin patrones genéricos de IA
