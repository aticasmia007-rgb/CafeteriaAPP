Revisa este componente de la cafetería IES Pío Baroja y propón mejoras concretas.

$ARGUMENTS

Evalúa en este orden:
1. ¿Usa tokens de `src/styles/global.css` o hardcodea valores? (`color: white` → `var(--color-white)`, etc.)
2. ¿Respeta los 3 breakpoints (`< 768px`, `≥ 768px`, `≥ 1024px`)?
3. **Organización de media queries**: ¿todas las `@media` están agrupadas AL FINAL del archivo, después de todas las reglas base? El patrón obligatorio es: (1) todos los selectores base primero, (2) un bloque `@media (min-width: 768px) { … }` con todos los overrides de tablet, (3) un bloque `@media (min-width: 1024px) { … }` con todos los overrides de desktop. NO intercalar media queries entre selectores base — eso viola el cascade gotcha de CLAUDE.md y dificulta la lectura. Si el archivo tiene queries dispersas, reorganízalo.
4. ¿Los iconos SVG usan `currentColor` en `stroke`/`fill`, con el color real en una clase CSS del padre? (NO `stroke="white"`, NO `stroke="var(--color-...)"` inline)
5. ¿La estética es coherente con una cafetería escolar (cálida, no genérica)? Verde oliva + terracota + cream + Fraunces.
6. ¿El CSS Module sigue el patrón del proyecto? (co-localizado, sin globals filtrados)

Checks adicionales específicos del proyecto:
7. **Padding-inline**: ¿`.content` define su propio `padding-inline: 20px` (móvil) y `clamp(2rem, 6vw, 5rem)` (`≥ 768px`)? `App.module.css` solo provee `padding-block`.
8. **`min-width: 0` en flex items**: si la sección contiene un `.horizontalScroll` (o cualquier scroll con cards `flex-shrink: 0`), el flex item padre debe tener `min-width: 0` para no empujar el layout más ancho que el viewport.
9. **Scroll horizontal**: ¿el `.horizontalScroll` tiene padding vertical generoso (≥14px arriba / 20px abajo) para que la sombra de las cards y el `transform: translateY(-2px)` del hover no se recorten? ¿Tiene `scroll-padding-inline` para que el snap respete el gutter?
10. **Variables inexistentes**: `--color-gray-50` NO existe — usar `--color-surface` para fondos muy claros.
11. **Padding responsive en HomeContent (3 breakpoints)**: las secciones del home bleedean full-width mientras cada bloque interno aplica su propio gutter. Verifica que cada nueva sección siga este patrón exacto:

    - **`.content` del home**: solo `padding-block` (`16px 0 24px` móvil, `24px 0 32px` en `≥ 1024px`). NUNCA `padding-inline` aquí — rompe el bleed del `.horizontalScroll`.
    - **Bloques con gutter** (`.sectionHeader`, `.ordersList`, `.emptyState`, cualquier nuevo bloque de texto/lista):
      ```css
      /* < 768px */  padding-inline: 20px;   /* o margin-inline para .emptyState */
      /* ≥ 768px */  padding-inline: clamp(2rem, 6vw, 5rem);
      /* ≥ 1024px */ hereda del ≥ 768px salvo necesidad específica
      ```
    - **`.horizontalScroll`** (móvil = scroll, tablet/desktop = grid):
      ```css
      /* < 768px */
      padding: 14px 20px 20px;          /* vertical para shadow + hover; horizontal = gutter interno */
      scroll-padding-inline: 20px;      /* snap respeta el gutter */
      /* ≥ 768px */
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      overflow-x: visible;
      padding: 14px clamp(2rem, 6vw, 5rem) 20px;
      ```
    - **Sección contenedora (`.section`)**: `min-width: 0` obligatorio si contiene `.horizontalScroll` (ver check #8). NUNCA añadir `padding-inline` a `.section` — el gutter lo ponen los hijos para que el scroll bleedee.
    - **Consistencia**: los tres breakpoints deben usar los mismos valores base (`20px` móvil / `clamp(2rem, 6vw, 5rem)` tablet+desktop). Si un bloque del home usa otros valores (ej. `16px`, `32px` fijo), márcalo como inconsistencia.

Devuelve el componente corregido con los cambios explicados línea a línea.
