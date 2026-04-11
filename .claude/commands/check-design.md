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
7. **Padding-inline y `--padding-x-inner-elements`**: El gutter horizontal se gestiona con una CSS custom property declarada en `.content` y heredada por los hijos. Hay dos subpatrones según si el componente tiene `.horizontalScroll` o no:

    **Componentes CON `.horizontalScroll`** (ej. `HomeContent`):
    `.content` NUNCA lleva `padding-inline` — lo rompería. El gutter lo fijan los hijos individualmente en móvil (`padding: 0 20px`) y heredan `--padding-x-inner-elements` en tablet/desktop:
    ```css
    /* base (< 768px): .content sin padding-inline; hijos con padding: 0 20px */
    @media (min-width: 768px) {
      .content { --padding-x-inner-elements: clamp(2rem, 10vw, 8rem); }
      .sectionHeader { padding: 0 var(--padding-x-inner-elements); }
      .horizontalScroll { padding: 14px var(--padding-x-inner-elements) 20px; }
      .ordersList { padding: 0 var(--padding-x-inner-elements); }
      .emptyState { margin: 0 var(--padding-x-inner-elements); }
    }
    @media (min-width: 1024px) {
      .content { --padding-x-inner-elements: clamp(2rem, 20vw, 25rem); }
      /* hijos heredan automáticamente el nuevo valor */
    }
    ```

    **Componentes SIN `.horizontalScroll`** (ej. `SearchContent`, `CartContent`, `ProfileView`, `HistoryView`):
    `.content` lleva `padding-inline` directamente y actualiza `--padding-x-inner-elements` en cada breakpoint:
    ```css
    /* base (< 768px) */
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

8. **`min-width: 0` en flex items**: si la sección contiene un `.horizontalScroll` (o cualquier scroll con cards `flex-shrink: 0`), el flex item padre debe tener `min-width: 0` para no empujar el layout más ancho que el viewport.
9. **Scroll horizontal**: ¿el `.horizontalScroll` tiene padding vertical generoso (≥14px arriba / 20px abajo) para que la sombra de las cards y el `transform: translateY(-2px)` del hover no se recorten? ¿Tiene `scroll-padding-inline` para que el snap respete el gutter?
10. **Variables inexistentes**: `--color-gray-50` NO existe — usar `--color-surface` para fondos muy claros.
11. **Padding responsive en HomeContent (3 breakpoints)**: las secciones del home bleedean full-width mientras cada bloque interno aplica su propio gutter. Verifica que cada nueva sección siga este patrón exacto:

    - **`.content` del home**: solo `padding-block` (`16px 0 24px` móvil, `24px 0 32px` en `≥ 1024px`). NUNCA `padding-inline` aquí — rompe el bleed del `.horizontalScroll`.
    - **Bloques con gutter** usan `padding: 0 20px` en móvil y heredan `var(--padding-x-inner-elements)` en tablet/desktop (ver check #7).
    - **`.horizontalScroll`** (móvil = scroll, tablet/desktop = grid):
      ```css
      /* < 768px */
      padding: 14px 20px 20px;
      scroll-padding-inline: 20px;
      /* ≥ 768px */
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      overflow-x: visible;
      padding: 14px var(--padding-x-inner-elements) 20px;
      ```
    - **Sección contenedora (`.section`)**: `min-width: 0` obligatorio. NUNCA `padding-inline` aquí.
    - **Consistencia**: móvil siempre `20px`; tablet `clamp(2rem, 10vw, 8rem)`; desktop `clamp(2rem, 20vw, 25rem)`. Marcar como inconsistencia cualquier valor distinto.

Devuelve el componente corregido con los cambios explicados línea a línea.
