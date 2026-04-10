Crea una nueva página estática para la cafetería IES Pío Baroja.

Página: $ARGUMENTS

## Arquitectura
- Archivo `.astro` en `src/pages/`
- Usa `src/layouts/Layout.astro` como wrapper (importa fuentes Fraunces + DM Sans y `global.css`)
- Sin React ni `client:load` salvo que la interactividad sea estrictamente necesaria
- Datos importados directamente desde `src/data/mockData.ts` en el frontmatter
- CSS con `<style>` scoped dentro del propio `.astro`

## Estética y tokens
- Coherente con el resto de la app — usa tokens de `src/styles/global.css`:
  - Colores: `var(--color-primary)` (verde oliva), `var(--color-accent)` (terracota), `var(--color-bg)` (cream), `var(--color-surface)`
  - Tipografía: `var(--font-display)` (Fraunces serif italic) para títulos, `var(--font-family)` (DM Sans) para texto
  - Radios: `var(--radius-sm/md/lg/full)`
  - Sombras: `var(--shadow-sm/md/lg)`
- Sin gradientes púrpura ni estéticas de IA genéricas

## Responsive
- `< 768px` móvil
- `≥ 768px` tablet
- `≥ 1024px` desktop

Las media queries van DESPUÉS de las reglas base (cascade gotcha del proyecto).

## Convenciones
- UI copy en **español**
- Iconos SVG inline con `stroke="currentColor"` (color en CSS, no inline)
- Sin JavaScript innecesario — esta es una página estática Astro pura
