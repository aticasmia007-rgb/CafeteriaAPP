// Mock data for the cafeteria app

/** True when a Product.image value is a URL (file in /public or external) rather than an emoji. */
export const isImageUrl = (image: string): boolean =>
  image.startsWith("/") || image.startsWith("http");

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  categories: string[];
  description: string;
  discount?: number;
  requiresPreparation?: boolean;
  isFavorite?: boolean;
  recommended?: boolean;
  allergens?: string[]; 
}

export const ALLERGENS = [
  { id: "gluten",   label: "Gluten",          detail: "trigo, centeno, cebada, avena", icon: "🌾" },
  { id: "crustaceos", label: "Crustáceos",    detail: "",                               icon: "🦐" },
  { id: "huevos",   label: "Huevos",          detail: "",                               icon: "🥚" },
  { id: "pescado",  label: "Pescado",          detail: "",                               icon: "🐟" },
  { id: "cacahuetes", label: "Cacahuetes",    detail: "",                               icon: "🥜" },
  { id: "soja",     label: "Soja",            detail: "",                               icon: "🫘" },
  { id: "leche",    label: "Leche",           detail: "",                               icon: "🥛" },
  { id: "frutos_cascara", label: "Frutos de cáscara", detail: "almendras, avellanas, nueces, anacardos, pacanas, nueces de Brasil, pistachos, macadamia", icon: "🌰" },
  { id: "apio",     label: "Apio",            detail: "",                               icon: "🥬" },
  { id: "mostaza",  label: "Mostaza",         detail: "",                               icon: "🌿" },
  { id: "sesamo",   label: "Sésamo",          detail: "",                               icon: "⚪" },
  { id: "sulfitos", label: "Sulfitos",        detail: "dióxido de azufre >10 mg/kg o mg/L", icon: "🧪" },
  { id: "altramuz", label: "Altramuz",        detail: "",                               icon: "🌼" },
  { id: "moluscos", label: "Moluscos",        detail: "",                               icon: "🐚" },
] as const;

export type AllergenId = typeof ALLERGENS[number]["id"];

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface OrderGroup {
  id: number;
  date: string;
  items: Product[];
}

export const categories = [
  { id: "all", name: "Todos", icon: "🍽️" },
  { id: "healthy", name: "Saludable", icon: "🥦"}, 
  { id: "bocadillos", name: "Bocadillos", icon: "🥖" },
  { id: "bebidas", name: "Bebidas", icon: "🥤" },
  { id: "postres", name: "Postres", icon: "🍰" },
  { id: "snacks", name: "Snacks", icon: "🍿" },
  { id: "cafe", name: "Café", icon: "☕" },
  { id: "fruta", name: "Fruta", icon: "🍎" },
];

export const products: Product[] = [
  { id: 1, name: "Bocadillo de Jamón", allergens:["gluten", "sesamo"], price: 2.50, image: "/bocatav2.webp", categories: ["bocadillos"], description: "Jamón serrano con tomate", discount: 15, requiresPreparation: true, recommended: true },
  { id: 2, name: "Bocadillo Vegetal", price: 2.80, image: "🥬", categories: ["bocadillos", "healthy"], description: "Lechuga, tomate, huevo y atún", allergens: ["gluten", "huevos", "pescado", "sesamo"], requiresPreparation: true, recommended: true },
  { id: 3, name: "Café con Leche", price: 1.20, image: "/cafe-leche.webp", categories: ["cafe"], description: "Café con leche semidesnatada", allergens: ["leche"], requiresPreparation: true, recommended: true },
  { id: 4, name: "Zumo de Naranja", price: 1.50, image: "/jugo-naranja.webp", categories: ["bebidas", "healthy"], description: "Zumo natural", discount: 10, recommended: true },
  { id: 5, name: "Fuze Tea", price: 0.80, image: "/fuze-tea.webp", categories: ["bebidas"], description: "Lata 250ml" },
  { id: 6, name: "Tarta de Manzana", price: 1.80, image: "/tarta.webp", categories: ["postres"], description: "Porción casera", allergens: ["gluten", "huevos", "leche"], discount: 20, recommended: true },
  { id: 7, name: "Croissant", price: 1.10, image: "/croissant.webp", categories: ["snacks"], description: "Croissant de mantequilla", allergens: ["gluten", "leche", "huevos"], recommended: true },
  { id: 8, name: "Fruta del Día", price: 0.70, image: "/fruit.webp", categories: ["fruta", "healthy"], description: "Manzana, plátano o naranja", recommended: true },
  { id: 9, name: "Patatas Fritas", price: 1.00, image: "🍟", categories: ["snacks"], description: "Bolsa individual", recommended: true },
  { id: 10, name: "Batido Chocolate", price: 1.60, image: "/chocolate.webp", categories: ["bebidas"], description: "Batido de chocolate frío", allergens: ["leche", "soja"], recommended: true },
  { id: 11, name: "Tortilla", price: 2.20, image: "/tortilla.webp", categories: ["bocadillos"], description: "Pincho de tortilla con pan", allergens: ["gluten", "huevos"], requiresPreparation: true, recommended: true },
  { id: 12, name: "Galletas", price: 0.90, image: "/galleta.webp", categories: ["snacks"], description: "Paquete de galletas María", allergens: ["gluten", "leche"], recommended: true },
  { id: 13, name: "Yogur Natural", price: 0.95, image: "🥄", categories: ["postres", "healthy"], description: "Yogur natural sin azúcar", allergens: ["leche"], recommended: true },
  { id: 14, name: "Cortado", price: 1.00, image: "/cortado.webp", categories: ["cafe"], description: "Café cortado con leche", allergens: ["leche"], discount: 5, requiresPreparation: true, recommended: true },
  { id: 15, name: "Bocadillo Mixto", price: 2.30, image: "🧀", categories: ["bocadillos"], description: "Jamón york y queso a la plancha", allergens: ["gluten", "leche", "sesamo"], recommended: true },
  { id: 16, name: "Napolitana de Chocolate", price: 1.30, image: "🥐", categories: ["snacks"], description: "Hojaldre relleno de crema de cacao", allergens: ["gluten", "leche", "huevos", "soja"] },
  { id: 17, name: "Agua Mineral", price: 0.50, image: "💧", categories: ["bebidas", "healthy"], description: "Botella 500ml" },
  { id: 18, name: "Bocadillo de Atún", price: 2.60, image: "🥪", categories: ["bocadillos"], description: "Atún con tomate natural y aceite de oliva", allergens: ["gluten", "pescado", "sesamo"], recommended: true },
  { id: 19, name: "Té Verde", price: 1.00, image: "🍵", categories: ["cafe", "healthy"], description: "Infusión de té verde en bolsita" },
  { id: 20, name: "Muffin de Arándanos", price: 1.40, image: "🧁", categories: ["postres"], description: "Bizcocho esponjoso con arándanos frescos", allergens: ["gluten", "huevos", "leche"], discount: 10 },
  { id: 21, name: "Bocadillo de Lomo", price: 2.90, image: "🥩", categories: ["bocadillos"], description: "Lomo de cerdo a la plancha con pimientos", allergens: ["gluten", "sesamo"] },
  { id: 22, name: "Refresco Cola", price: 1.10, image: "🥤", categories: ["bebidas"], description: "Lata 330ml" },
  { id: 23, name: "Barrita de Cereales", price: 0.80, image: "🌾", categories: ["snacks", "healthy"], description: "Barrita de avena con miel y frutos secos", allergens: ["gluten", "frutos_cascara", "leche"], recommended: true },
  { id: 24, name: "Flan de Huevo", price: 1.20, image: "🍮", categories: ["postres"], description: "Flan casero con caramelo", allergens: ["huevos", "leche"], discount: 15 },
  { id: 25, name: "Cappuccino", price: 1.50, image: "☕", categories: ["cafe"], description: "Café espresso con leche vaporizada y espuma", allergens: ["leche"], requiresPreparation: true, recommended: true },
];

export const notifications: Notification[] = [
  { id: 1, title: "Pedido listo", message: "Tu pedido #42 está listo para recoger", time: "Hace 5 min", read: false },
  { id: 2, title: "Oferta especial", message: "Hoy 20% de descuento en tartas", time: "Hace 30 min", read: false },
  { id: 3, title: "Nuevo producto", message: "Prueba nuestro nuevo batido tropical", time: "Hace 1h", read: true },
  { id: 4, title: "Puntos canjeados", message: "Has canjeado 50 puntos por un café gratis", time: "Hace 2h", read: true },
];

export const recentOrders: OrderGroup[] = [
  {
    id: 1,
    date: "Hoy, 10:30",
    items: [products[0], products[2], products[7]],
  },
  {
    id: 2,
    date: "Ayer, 11:00",
    items: [products[5], products[3]],
  },
  {
    id: 3,
    date: "28 Mar, 10:15",
    items: [products[1], products[9], products[11]],
  },
];

export const favoriteProductIds = [1, 3, 6, 8, 10];

export interface PendingOrderItem {
  product: Product;
  quantity: number;
}

export interface PendingOrder {
  id: string;        // e.g. "#adb323" — 3 letters + 3 digits
  items: PendingOrderItem[];
  total: number;
  claimSlot: string; // e.g. "10:30 – 10:45"
  placedAt: string;  // e.g. "Hace 3 min"
}

/** Pre-seeded pending order visible to both the client and the admin QR scanner. */
export const mockPendingOrders: PendingOrder[] = [
  {
    id: "#test01",
    items: [
      { product: { id: 1, name: "Bocadillo de Jamón", price: 2.50, image: "/bocatav2.webp", categories: ["bocadillos"], description: "Jamón serrano con tomate", discount: 15 }, quantity: 1 },
      { product: { id: 3, name: "Café con Leche", price: 1.20, image: "/cafe-leche.webp", categories: ["cafe"], description: "Café con leche semidesnatada" }, quantity: 2 },
    ],
    total: 4.525,
    claimSlot: "10:30 – 10:45",
    placedAt: "Hace 2 min",
  },
];


