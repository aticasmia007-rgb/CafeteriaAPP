Revisa este componente de la cafetería IES Pío Baroja y propón mejoras concretas.

$ARGUMENTS

Evalúa en este orden:
1. ¿Usa tokens de `src/styles/global.css` o hardcodea valores? (`color: white` → `var(--color-white)`, etc.)
2. ¿Respeta los 3 breakpoints (`< 768px`, `≥ 768px`, `≥ 1024px`)?
3. ¿Las media queries están DESPUÉS de las reglas base? (cascade gotcha — ver CLAUDE.md)
4. ¿Los iconos SVG usan `currentColor` en `stroke`/`fill`, con el color real en una clase CSS del padre? (NO `stroke="white"`, NO `stroke="var(--color-...)"` inline)
5. ¿La estética es coherente con una cafetería escolar (cálida, no genérica)? Verde oliva + terracota + cream + Fraunces.
6. ¿El CSS Module sigue el patrón del proyecto? (co-localizado, sin globals filtrados)

Checks adicionales específicos del proyecto:
7. **Padding-inline**: ¿`.content` define su propio `padding-inline: 20px` (móvil) y `clamp(2rem, 6vw, 5rem)` (`≥ 768px`)? `App.module.css` solo provee `padding-block`.
8. **`min-width: 0` en flex items**: si la sección contiene un `.horizontalScroll` (o cualquier scroll con cards `flex-shrink: 0`), el flex item padre debe tener `min-width: 0` para no empujar el layout más ancho que el viewport.
9. **Scroll horizontal**: ¿el `.horizontalScroll` tiene padding vertical generoso (≥14px arriba / 20px abajo) para que la sombra de las cards y el `transform: translateY(-2px)` del hover no se recorten? ¿Tiene `scroll-padding-inline` para que el snap respete el gutter?
10. **Variables inexistentes**: `--color-gray-50` NO existe — usar `--color-surface` para fondos muy claros.

Devuelve el componente corregido con los cambios explicados línea a línea.
