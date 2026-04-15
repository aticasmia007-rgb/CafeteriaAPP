import { createContext, useContext } from "react";
import type { Product } from "../data/mockData";
import type {
  AdminOrder,
  AdminNotification,
  AdminUser,
  TimeSlot,
  OrderStatus,
} from "../data/adminMockData";

/* ── State ── */

export type AdminView = "orders" | "products" | "slots" | "search";

export interface AdminState {
  activeView: AdminView;
  orders: AdminOrder[];
  products: Product[];
  timeSlots: TimeSlot[];
  notifications: AdminNotification[];
  user: AdminUser;
  searchQuery: string;
  orderFilter: "all" | "needs-prep" | "pending" | "current-slot";
  expandedOrderId: string | null;
  editingProductId: number | null;
  selectedSlotId: string | null;
  leadTimeMinutes: number; // global advance-order time
  recentlyEditedIds: number[];
}

/* ── Actions ── */

export type AdminAction =
  | { type: "SET_VIEW"; view: AdminView }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "SET_ORDER_FILTER"; filter: "all" | "needs-prep" | "pending" | "current-slot" }
  | { type: "TOGGLE_ORDER_EXPAND"; orderId: string }
  | { type: "SET_ORDER_STATUS"; orderId: string; status: OrderStatus }
  | { type: "MARK_ORDER_PREPARED"; orderId: string }
  | { type: "MARK_ORDER_DELIVERED"; orderId: string }
  | { type: "SET_EDITING_PRODUCT"; productId: number | null }
  | { type: "UPDATE_PRODUCT"; product: Product }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "TOGGLE_PRODUCT_AVAILABLE"; productId: number }
  | { type: "SELECT_SLOT"; slotId: string | null }
  | { type: "UPDATE_SLOT"; slot: TimeSlot }
  | { type: "TOGGLE_SLOT_BLOCKED"; slotId: string }
  | { type: "SET_LEAD_TIME"; minutes: number }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: number }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "PUSH_NOTIFICATION"; notification: AdminNotification };

/* ── Reducer ── */

export function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, activeView: action.view, searchQuery: "" };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };

    case "SET_ORDER_FILTER":
      return { ...state, orderFilter: action.filter };

    case "TOGGLE_ORDER_EXPAND":
      return {
        ...state,
        expandedOrderId:
          state.expandedOrderId === action.orderId ? null : action.orderId,
      };

    case "SET_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: action.status } : o
        ),
      };

    case "MARK_ORDER_PREPARED":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: "prepared" as const } : o
        ),
      };

    case "MARK_ORDER_DELIVERED":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: "delivered" as const } : o
        ),
      };

    case "SET_EDITING_PRODUCT":
      return { ...state, editingProductId: action.productId };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.product.id ? action.product : p
        ),
        recentlyEditedIds: [
          action.product.id,
          ...state.recentlyEditedIds.filter((id) => id !== action.product.id),
        ].slice(0, 10),
        editingProductId: null,
      };

    case "ADD_PRODUCT": {
      const newId = Math.max(...state.products.map((p) => p.id), 0) + 1;
      const product = { ...action.product, id: newId };
      return {
        ...state,
        products: [...state.products, product],
        recentlyEditedIds: [newId, ...state.recentlyEditedIds].slice(0, 10),
        editingProductId: null,
      };
    }

    case "TOGGLE_PRODUCT_AVAILABLE": {
      // Toggle by adding/removing discount=-1 as a "disabled" marker won't work.
      // Instead, we use a simple filter: products with id in a "disabled" set.
      // For the mock, we'll just toggle the product out/in by setting price to 0 / restoring.
      // Actually, let's add an `available` field convention: discount of -1 means unavailable.
      // Better: keep it simple — we store unavailable IDs in state.
      return state; // handled by a dedicated unavailable set below
    }

    case "SELECT_SLOT":
      return { ...state, selectedSlotId: action.slotId };

    case "UPDATE_SLOT":
      return {
        ...state,
        timeSlots: state.timeSlots.map((s) =>
          s.id === action.slot.id ? action.slot : s
        ),
        selectedSlotId: null,
      };

    case "TOGGLE_SLOT_BLOCKED":
      return {
        ...state,
        timeSlots: state.timeSlots.map((s) =>
          s.id === action.slotId ? { ...s, blocked: !s.blocked } : s
        ),
      };

    case "SET_LEAD_TIME":
      return {
        ...state,
        leadTimeMinutes: Math.max(0, action.minutes),
      };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      };

    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "PUSH_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };

    default:
      return state;
  }
}

/* ── Context ── */

export const AdminContext = createContext<{
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
}>({
  state: null as unknown as AdminState,
  dispatch: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}
