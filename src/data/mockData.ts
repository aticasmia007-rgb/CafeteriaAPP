// Mock data for the cafeteria app

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  discount?: number;
  isFavorite?: boolean;
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
  { id: "bocadillos", name: "Bocadillos", icon: "🥖" },
  { id: "bebidas", name: "Bebidas", icon: "🥤" },
  { id: "postres", name: "Postres", icon: "🍰" },
  { id: "snacks", name: "Snacks", icon: "🍿" },
  { id: "cafe", name: "Café", icon: "☕" },
  { id: "fruta", name: "Fruta", icon: "🍎" },
];

export const products: Product[] = [
  { id: 1, name: "Bocadillo de Jamón", price: 2.50, image: "🥖", category: "bocadillos", description: "Jamón serrano con tomate", discount: 15 },
  { id: 2, name: "Bocadillo Vegetal", price: 2.80, image: "🥬", category: "bocadillos", description: "Lechuga, tomate, huevo y atún" },
  { id: 3, name: "Café con Leche", price: 1.20, image: "☕", category: "cafe", description: "Café con leche semidesnatada" },
  { id: 4, name: "Zumo de Naranja", price: 1.50, image: "🍊", category: "bebidas", description: "Zumo natural recién exprimido", discount: 10 },
  { id: 5, name: "Agua Mineral", price: 0.80, image: "💧", category: "bebidas", description: "Botella 500ml" },
  { id: 6, name: "Tarta de Manzana", price: 1.80, image: "🍰", category: "postres", description: "Porción casera", discount: 20 },
  { id: 7, name: "Croissant", price: 1.10, image: "🥐", category: "snacks", description: "Croissant de mantequilla" },
  { id: 8, name: "Fruta del Día", price: 0.70, image: "🍎", category: "fruta", description: "Manzana, plátano o naranja" },
  { id: 9, name: "Patatas Fritas", price: 1.00, image: "🍟", category: "snacks", description: "Bolsa individual" },
  { id: 10, name: "Batido Chocolate", price: 1.60, image: "🥛", category: "bebidas", description: "Batido de chocolate frío" },
  { id: 11, name: "Tortilla Española", price: 2.20, image: "🍳", category: "bocadillos", description: "Pincho de tortilla con pan" },
  { id: 12, name: "Galletas", price: 0.90, image: "🍪", category: "snacks", description: "Paquete de galletas María" },
  { id: 13, name: "Yogur Natural", price: 0.95, image: "🥄", category: "postres", description: "Yogur natural sin azúcar" },
  { id: 14, name: "Cortado", price: 1.00, image: "☕", category: "cafe", description: "Café cortado con leche", discount: 5 },
  { id: 15, name: "Bocadillo Mixto", price: 2.30, image: "🧀", category: "bocadillos", description: "Jamón york y queso a la plancha" },
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
