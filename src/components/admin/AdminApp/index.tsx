import { useEffect, useReducer } from "react";
import {
  AdminContext,
  adminReducer,
  type AdminState,
} from "../../../store/adminStore";
import {
  adminOrders,
  adminNotifications,
  adminUser,
  timeSlots as mockSlots,
  recentlyEditedProductIds,
} from "../../../data/adminMockData";
import { products as mockProducts } from "../../../data/mockData";
import { getAllOrders, getAdminSlots, getProducts, getCategories, getAllergens, mapApiProduct, mapApiCategory } from "../../../services/api";
import type { AdminOrder } from "../../../data/adminMockData";
import AdminHeader from "../AdminHeader";
import AdminNav from "../AdminNav";
import OrdersView from "../OrdersView";
import ProductsView from "../ProductsView";
import TimeSlotsView from "../TimeSlotsView";
import AdminSearch from "../AdminSearch";
import styles from "./AdminApp.module.css";

const initialState: AdminState = {
  activeView: "orders",
  orders: adminOrders,
  products: mockProducts,
  categories: [],
  allergens: [],
  timeSlots: mockSlots,
  notifications: adminNotifications,
  user: adminUser,
  searchQuery: "",
  orderFilter: "pending",
  expandedOrderId: null,
  editingProductId: null,
  selectedSlotId: null,
  leadTimeMinutes: 30,
  recentlyEditedIds: recentlyEditedProductIds,
};

function mapApiOrderToAdmin(order: import("../../../services/api").ApiOrder, products: import("../../../data/mockData").Product[]): AdminOrder {
  const items = order.items.map((item) => {
    const product = products.find((p) => p.id === item.product_id) ?? {
      id: item.product_id,
      name: item.product_name,
      price: parseFloat(item.unit_price),
      image: "🍽️",
      categories: [],
      description: "",
    };
    return { product, quantity: item.quantity };
  });

  const stateMap: Record<string, import("../../../data/adminMockData").OrderStatus> = {
    pending: "pending",
    paid: "pending",
    preparing: "pending",
    ready: "prepared",
    collected: "delivered",
    cancelled: "delivered",
  };

  const createdAt = new Date(order.created_at);
  const placedAt = `${createdAt.getHours().toString().padStart(2, "0")}:${createdAt.getMinutes().toString().padStart(2, "0")}`;

  return {
    id: order.id,
    code: order.pickup_code ? `#${order.pickup_code}` : `#${order.id.slice(-6).toUpperCase()}`,
    studentName: order.client?.name ?? "Estudiante",
    items,
    total: parseFloat(order.total),
    status: stateMap[order.state] ?? "pending",
    needsPrep: items.some((i) => i.product.requiresPreparation === true),
    timeSlotId: order.slot.id,
    placedAt,
  };
}

export default function AdminApp() {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Try to load real data from the API (requires admin JWT — falls back to mock if unavailable)
  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getAllergens(), getAdminSlots(), getAllOrders()])
      .then(([apiProducts, apiCategories, apiAllergens, apiSlots, apiOrders]) => {
        const products = apiProducts.map(mapApiProduct);
        const categories = apiCategories.map(mapApiCategory);
        const allergens = apiAllergens.map((a) => ({
          id: a.allergen_id,
          name: a.name,
          icon: a.icon ?? "⚠️",
        }));
        const timeSlots = apiSlots.map((s) => ({
          id: s.slot_id,
          name: s.label,
          startTime: s.start_time ?? "00:00",
          endTime: s.end_time ?? "23:59",
          maxOrders: s.capacity,
          currentOrders: s.capacity - (s.remaining ?? s.capacity),
          blocked: s.active === false,
        }));
        const orders = apiOrders.map((o) => mapApiOrderToAdmin(o, products));
        dispatch({ type: "LOAD_ADMIN_DATA", orders, products, categories, allergens, timeSlots });
      })
      .catch(() => {
        // No admin JWT yet (PIN-based auth) — keep mock data
      });
  }, []);

  return (
    <AdminContext.Provider value={{ state, dispatch }}>
      <div className={styles.adminApp}>
        <AdminHeader />
        <main className={styles.main}>
          {state.activeView === "orders" && <OrdersView />}
          {state.activeView === "products" && <ProductsView />}
          {state.activeView === "slots" && <TimeSlotsView />}
          {state.activeView === "search" && <AdminSearch />}
        </main>
        <AdminNav />
      </div>
    </AdminContext.Provider>
  );
}
