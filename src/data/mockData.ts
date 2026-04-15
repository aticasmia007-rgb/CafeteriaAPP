// Mock data for the cafeteria app

/** True when a Product.image value is a URL (file in /public or external) rather than an emoji. */
export const isImageUrl = (image: string): boolean =>
  image.startsWith("/") || image.startsWith("http");

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  discount?: number;
  isFavorite?: boolean;
  recommended?: boolean;
}

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
  { id: 1, name: "Bocadillo de Jamón", price: 2.50, image: "/bocatav2.png", category: "bocadillos", description: "Jamón serrano con tomate", discount: 15, recommended: true },
  { id: 2, name: "Bocadillo Vegetal", price: 2.80, image: "🥬", category: "bocadillos", description: "Lechuga, tomate, huevo y atún", recommended: true },
  { id: 3, name: "Café con Leche", price: 1.20, image: "/cafe-leche.jpg", category: "cafe", description: "Café con leche semidesnatada", recommended: true },
  { id: 4, name: "Zumo de Naranja", price: 1.50, image: "/jugo-naranja.jpg", category: "bebidas", description: "Zumo natural", discount: 10, recommended: true },
  { id: 5, name: "Fuze Tea", price: 0.80, image: "/fuze-tea.jpg", category: "bebidas", description: "Lata 250ml" },
  { id: 6, name: "Tarta de Manzana", price: 1.80, image: "/tarta.jpg", category: "postres", description: "Porción casera", discount: 20, recommended: true },
  { id: 7, name: "Croissant", price: 1.10, image: "/croissant.jpg", category: "snacks", description: "Croissant de mantequilla", recommended: true },
  { id: 8, name: "Fruta del Día", price: 0.70, image: "/fruit.jpg", category: "fruta", description: "Manzana, plátano o naranja", recommended: true },
  { id: 9, name: "Patatas Fritas", price: 1.00, image: "🍟", category: "snacks", description: "Bolsa individual" , recommended: true},
  { id: 10, name: "Batido Chocolate", price: 1.60, image: "/chocolate.jpg", category: "bebidas", description: "Batido de chocolate frío", recommended: true },
  { id: 11, name: "Tortilla", price: 2.20, image: "/tortilla.jpg", category: "bocadillos", description: "Pincho de tortilla con pan" , recommended: true},
  { id: 12, name: "Galletas", price: 0.90, image: "/galleta.jpg", category: "snacks", description: "Paquete de galletas María" , recommended: true},
  { id: 13, name: "Yogur Natural", price: 0.95, image: "🥄", category: "postres", description: "Yogur natural sin azúcar" , recommended: true},
  { id: 14, name: "Cortado", price: 1.00, image: "/cortado.jpg", category: "cafe", description: "Café cortado con leche", discount: 5, recommended: true },
  { id: 15, name: "Bocadillo Mixto", price: 2.30, image: "🧀", category: "bocadillos", description: "Jamón york y queso a la plancha", recommended: true },
  { id: 16, name: "Napolitana de Chocolate", price: 1.30, image: "🥐", category: "snacks", description: "Hojaldre relleno de crema de cacao" },
  { id: 17, name: "Agua Mineral", price: 0.50, image: "💧", category: "bebidas", description: "Botella 500ml" },
  { id: 18, name: "Bocadillo de Atún", price: 2.60, image: "🥪", category: "bocadillos", description: "Atún con tomate natural y aceite de oliva", recommended: true },
  { id: 19, name: "Té Verde", price: 1.00, image: "🍵", category: "cafe", description: "Infusión de té verde en bolsita" },
  { id: 20, name: "Muffin de Arándanos", price: 1.40, image: "🧁", category: "postres", description: "Bizcocho esponjoso con arándanos frescos", discount: 10 },
  { id: 21, name: "Bocadillo de Lomo", price: 2.90, image: "🥩", category: "bocadillos", description: "Lomo de cerdo a la plancha con pimientos" },
  { id: 22, name: "Refresco Cola", price: 1.10, image: "🥤", category: "bebidas", description: "Lata 330ml" },
  { id: 23, name: "Barrita de Cereales", price: 0.80, image: "🌾", category: "snacks", description: "Barrita de avena con miel y frutos secos", recommended: true },
  { id: 24, name: "Flan de Huevo", price: 1.20, image: "🍮", category: "postres", description: "Flan casero con caramelo", discount: 15 },
  { id: 25, name: "Cappuccino", price: 1.50, image: "☕", category: "cafe", description: "Café espresso con leche vaporizada y espuma", recommended: true },
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
      { product: { id: 1, name: "Bocadillo de Jamón", price: 2.50, image: "/bocatav2.png", category: "bocadillos", description: "Jamón serrano con tomate", discount: 15 }, quantity: 1 },
      { product: { id: 3, name: "Café con Leche", price: 1.20, image: "/cafe-leche.jpg", category: "cafe", description: "Café con leche semidesnatada" }, quantity: 2 },
    ],
    total: 4.525,
    claimSlot: "10:30 – 10:45",
    placedAt: "Hace 2 min",
  },
];

