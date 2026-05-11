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
  categories: { id: string; name: string; icon: string }[];
  allergens: { id: string; name: string; icon: string }[];
  timeSlots: TimeSlot[];
  notifications: AdminNotification[];
  user: AdminUser;
  searchQuery: string;
  orderFilter: "all" | "needs-prep" | "pending" | "current-slot";
  expandedOrderId: string | null;
  editingProductId: string | null;
  selectedSlotId: string | null;
  leadTimeMinutes: number;
  recentlyEditedIds: string[];
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
  | { type: "SET_EDITING_PRODUCT"; productId: string | null }
  | { type: "UPDATE_PRODUCT"; product: Product }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "TOGGLE_PRODUCT_AVAILABLE"; productId: string }
  | { type: "SELECT_SLOT"; slotId: string | null }
  | { type: "UPDATE_SLOT"; slot: TimeSlot }
  | { type: "TOGGLE_SLOT_BLOCKED"; slotId: string }
  | { type: "SET_LEAD_TIME"; minutes: number }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: number }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "PUSH_NOTIFICATION"; notification: AdminNotification }
  | { type: "LOAD_ADMIN_DATA"; orders: AdminOrder[]; products: Product[]; categories: { id: string; name: string; icon: string }[]; allergens: { id: string; name: string; icon: string }[]; timeSlots: TimeSlot[] };

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

    case "ADD_PRODUCT":
      return {
        ...state,
        products: [...state.products, action.product],
        recentlyEditedIds: [action.product.id, ...state.recentlyEditedIds].slice(0, 10),
        editingProductId: null,
      };

    case "TOGGLE_PRODUCT_AVAILABLE":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId ? { ...p, available: !(p.available ?? true) } : p
        ),
      };

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

    case "LOAD_ADMIN_DATA":
      return {
        ...state,
        orders: action.orders,
        products: action.products,
        categories: action.categories,
        allergens: action.allergens,
        timeSlots: action.timeSlots,
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
