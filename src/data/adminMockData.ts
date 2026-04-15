import { products, type Product } from "./mockData";

/* ── Admin User ── */

export interface AdminUser {
  name: string;
  role: string;
  avatar: string; // emoji or URL
}

export const adminUser: AdminUser = {
  name: "María García",
  role: "Encargada",
  avatar: "👩‍🍳",
};

/* ── Time Slots ── */

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string; // "HH:MM"
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  blocked: boolean;
}

export const timeSlots: TimeSlot[] = [
  { id: "t1", name: "Primer recreo", startTime: "10:00", endTime: "10:20", maxOrders: 25, currentOrders: 18, blocked: false },
  { id: "t2", name: "Segundo recreo", startTime: "10:20", endTime: "10:40", maxOrders: 30, currentOrders: 27, blocked: false },
  { id: "t3", name: "Tercer recreo", startTime: "10:40", endTime: "11:00", maxOrders: 20, currentOrders: 12, blocked: false },
  { id: "t4", name: "Mediodía", startTime: "13:00", endTime: "13:30", maxOrders: 35, currentOrders: 35, blocked: false },
  { id: "t5", name: "Tarde", startTime: "15:00", endTime: "15:20", maxOrders: 15, currentOrders: 4, blocked: false },
  { id: "t6", name: "Cierre", startTime: "16:00", endTime: "23:30", maxOrders: 10, currentOrders: 0, blocked: true },
];

/* ── Admin Orders ── */

export type OrderStatus = "pending" | "prepared" | "delivered";

export interface AdminOrderItem {
  product: Product;
  quantity: number;
}

export interface AdminOrder {
  id: string;
  code: string;         // display code like "#abc123"
  studentName: string;
  items: AdminOrderItem[];
  total: number;
  status: OrderStatus;
  needsPrep: boolean;   // requires time to prepare (bocadillos a medida, etc.)
  timeSlotId: string;
  placedAt: string;
}

const studentNames = [
  "Pablo Martín", "Lucía Fernández", "Hugo Sánchez", "Marta López",
  "Daniel García", "Carmen Ruiz", "Alejandro Torres", "Sara Navarro",
  "Adrián Moreno", "Laura Jiménez", "Álvaro Romero", "Elena Díaz",
  "Iker Álvarez", "Noa Muñoz", "Leo Herrero", "Valeria Ortiz",
];

function makeCode(): string {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join("");
  const digits = Math.floor(100 + Math.random() * 900);
  return `#${letters}${digits}`;
}

function pickItems(ids: number[]): AdminOrderItem[] {
  return ids.map((id) => ({
    product: products.find((p) => p.id === id)!,
    quantity: 1 + Math.floor(Math.random() * 3),
  }));
}

function calcTotal(items: AdminOrderItem[]): number {
  return items.reduce((sum, i) => {
    const price = i.product.discount
      ? i.product.price * (1 - i.product.discount / 100)
      : i.product.price;
    return sum + price * i.quantity;
  }, 0);
}

function order(
  studentIdx: number,
  productIds: number[],
  status: OrderStatus,
  slotId: string,
  placedAt: string,
): AdminOrder {
  const items = pickItems(productIds);
  return {
    id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    code: makeCode(),
    studentName: studentNames[studentIdx],
    items,
    total: calcTotal(items),
    status,
    needsPrep: items.some((i) => i.product.requiresPreparation === true),
    timeSlotId: slotId,
    placedAt,
  };
}

export const adminOrders: AdminOrder[] = [
  // Slot t1 — Primer recreo
  order(0, [1, 3], "pending", "t1", "09:48"),
  order(1, [7, 5], "pending", "t1", "09:50"),
  order(2, [11, 4], "prepared", "t1", "09:42"),
  order(3, [8, 9], "delivered", "t1", "09:35"),
  // Slot t2 — Segundo recreo
  order(4, [1, 10, 3], "pending", "t2", "10:05"),
  order(5, [6], "pending", "t2", "10:08"),
  order(6, [2, 14], "prepared", "t2", "09:58"),
  order(7, [15, 12], "pending", "t2", "10:10"),
  order(8, [17, 9], "delivered", "t2", "09:55"),
  order(9, [7, 3], "prepared", "t2", "10:02"),
  // Slot t3 — Tercer recreo
  order(10, [18, 4], "pending", "t3", "10:25"),
  order(11, [13, 19], "pending", "t3", "10:28"),
  // Slot t4 — Mediodía
  order(12, [1, 2, 10], "pending", "t4", "12:40"),
  order(13, [21, 3], "pending", "t4", "12:45"),
  order(14, [11, 25, 6], "pending", "t4", "12:50"),
  order(15, [15, 22, 9], "pending", "t4", "12:52"),
  // Slot t5 — Tarde
  order(0, [3, 7], "pending", "t5", "14:50"),
];

/* ── Admin Notifications ── */

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const adminNotifications: AdminNotification[] = [
  { id: 1, title: "Stock bajo", message: "Quedan 3 unidades de Tarta de Manzana", time: "Hace 5 min", read: false },
  { id: 2, title: "Tramo lleno", message: "El tramo Mediodía ha alcanzado el límite de pedidos", time: "Hace 15 min", read: false },
  { id: 3, title: "Nuevo pedido urgente", message: "Pablo Martín ha realizado un pedido que necesita preparación", time: "Hace 20 min", read: true },
  { id: 4, title: "Pedido cancelado", message: "Laura Jiménez ha cancelado el pedido #xyz789", time: "Hace 1h", read: true },
];

/* ── Recently edited products (IDs) ── */

export const recentlyEditedProductIds = [1, 6, 11, 3, 7];
