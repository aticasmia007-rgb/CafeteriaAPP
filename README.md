# Cafetería IES Pío Baroja — Prototipo cliente

Prototipo de aplicación de pedidos para la cafetería del instituto **IES Pío Baroja**. Sitio estático con Astro que monta una isla React; todos los datos son mock — no hay backend.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | [Astro](https://astro.build) (static + SSR para admin) |
| UI | React 19 + TypeScript |
| Estilos | CSS Modules + tokens globales |
| Estado | `useReducer` + Context (sin librerías externas) |
| Package manager | pnpm (Node ≥ 22.12.0) |

---

## Requisitos

- Node ≥ 22.12.0
- pnpm

---

## Comandos

```bash
pnpm install        # instalar dependencias
pnpm dev            # servidor de desarrollo en localhost:4321
pnpm build          # build estático en ./dist/
pnpm preview        # previsualizar el build de producción
pnpm astro check    # type-check Astro + TypeScript
```

---

## Estructura del proyecto

```
src/
├── pages/
│   ├── index.astro           # App cliente
│   └── admin/
│       ├── index.astro       # Panel admin (protegido)
│       ├── login.astro       # Login con PIN
│       └── logout.astro      # Cierra sesión
├── components/
│   ├── App/                  # Raíz de la isla React cliente
│   ├── TopBar/
│   ├── BottomNav/
│   ├── HomeContent/
│   ├── SearchContent/
│   ├── CartContent/
│   ├── ProfileView/
│   ├── HistoryView/
│   ├── ProductCard/
│   ├── AuthSheet/
│   ├── PendingOrders/
│   ├── PendingOrderSheet/
│   ├── RecentOrders/
│   ├── CategoryFilters/
│   ├── admin/
│   │   ├── AdminApp/         # Raíz de la isla React admin
│   │   ├── AdminHeader/
│   │   ├── AdminNav/
│   │   ├── OrdersView/       # Gestión de pedidos con filtros
│   │   ├── OrderCard/
│   │   ├── ProductsView/
│   │   ├── ProductEditor/    # Editor multi-categoría + alérgenos
│   │   ├── TimeSlotsView/    # Control de tramos horarios
│   │   ├── SlotModal/
│   │   ├── AdminSearch/
│   │   ├── QRScanner/        # Escáner de cámara con jsQR
│   │   ├── QRScanFab/        # FAB reutilizable (QRScanner + ScannedOrderSheet)
│   │   └── ScannedOrderSheet/
│   └── shared/               # Componentes utilitarios compartidos
├── store/
│   ├── appStore.ts           # Estado cliente (useReducer + Context)
│   └── adminStore.ts         # Estado admin
├── data/
│   ├── mockData.ts           # Products, categories, orders mock
│   └── adminMockData.ts      # Pedidos admin, tramos, notificaciones
├── layouts/
│   ├── Layout.astro
│   └── AdminLayout.astro
└── styles/
    ├── global.css            # Tokens de diseño (colores, radios, sombras)
    └── admin.css
```

---

## Funcionalidades

### App cliente (`/`)
- Catálogo de productos con filtros por categoría (un producto puede tener varias categorías)
- Búsqueda en tiempo real
- Carrito con stepper de cantidad
- Favoritos
- Flujo de pago con auth gate (login requerido solo al pagar)
- Pedidos pendientes con código QR para recogida
- Historial de pedidos
- Diseño responsive: móvil / tablet / escritorio

### Panel de administración (`/admin`)
- Protegido con PIN + cookie de sesión (8 h, `httpOnly`)
- **Pedidos:** listado por tramo horario con filtros — `Todos`, `Pendientes`, `Necesitan preparación`, `Tramo actual`
  - Tramo activo marcado con punto verde parpadeante en tiempo real
  - Todos los tramos siempre visibles; los vacíos muestran un placeholder
- **Productos:** editor con nombre, precio, descuento, descripción, multi-categoría, 14 alérgenos, toggle "requiere preparación" e imagen
- **Tramos horarios:** stepper de tiempo de antelación + gráfica de afluencia (sticky en escritorio) + lista de tramos con barra de capacidad
- **Búsqueda:** pedidos, productos y alumnos; escáner QR integrado
- **Escáner QR:** lee el código del pedido del cliente vía cámara (`jsQR`) y abre el detalle

---

## Modelo de datos clave

### `Product`

```ts
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;            // emoji o ruta "/archivo.jpg"
  categories: string[];     // array — un producto puede pertenecer a varias categorías
  description: string;
  discount?: number;        // porcentaje de descuento
  requiresPreparation?: boolean; // necesita trabajo activo en cocina
  allergens?: string[];     // ids de ALLERGENS[]
  recommended?: boolean;
}
```

### `AdminOrder.needsPrep`

Se deriva automáticamente de `items.some(i => i.product.requiresPreparation === true)` dentro del helper `order()` — nunca se asigna manualmente.

---

## Despliegue

Las páginas del admin usan `export const prerender = false` (SSR para cookies), por lo que **GitHub Pages no es compatible**. Opciones recomendadas:

| Plataforma | Notas |
|---|---|
| **Vercel** | Detección automática de Astro + pnpm, cero configuración |
| **Netlify** | Requiere adaptador `@astrojs/netlify` |
| **Cloudflare Pages** | Requiere adaptador `@astrojs/cloudflare` |

Para desplegar únicamente la app cliente (sin admin) en GitHub Pages, añadir en `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://<usuario>.github.io',
  base: '/<nombre-repo>',
});
```

Y un workflow en `.github/workflows/deploy.yml` usando `withastro/action@v3` + `actions/deploy-pages@v4`.

---

## Convenciones de desarrollo

- **CSS Modules** co-localizados por componente — sin Tailwind, sin CSS-in-JS
- **Media queries al final** del archivo CSS, nunca intercaladas entre reglas base
- **`dvh` en lugar de `vh`** para alturas de pantalla completa
- **`font-size: 16px` mínimo** en todos los `<input>` / `<select>` (evita auto-zoom en iOS Safari)
- **`currentColor`** en todos los SVG — el color real se declara en la clase CSS del padre, nunca inline
- **`QRScanFab`** es el componente reutilizable para escáner QR en el admin — no reimplementar inline

Ver [`CLAUDE.md`](./CLAUDE.md) para la guía completa de arquitectura y convenciones.