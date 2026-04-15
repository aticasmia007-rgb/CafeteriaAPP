// Simple global state using React context + useReducer
import { createContext, useContext } from "react";
import type { Product, Notification, PendingOrder } from "../data/mockData";
import { mockPendingOrders } from "../data/mockData";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  email: string;
  name: string;
  provider: "email" | "google";
}

export type AuthIntent = "checkout" | "profile" | "login" | null;

export interface AppState {
  activeTab: "home" | "search" | "cart" | "profile" | "history";
  activeCategory: string;
  cart: CartItem[];
  favorites: number[];
  notifications: Notification[];
  searchQuery: string;
  user: User | null;
  authSheetOpen: boolean;
  pendingIntent: AuthIntent;
  pendingOrders: PendingOrder[];
  pendingOrderSheetOpen: boolean;
  selectedPendingOrderId: string | null;
  selectedPickupSlot: string | null;
  allergenSheetOpen: boolean;
  productoSeleccionado: Product | null;
  paymentSheetOpen: boolean;
}

export type AppAction =
  | { type: "SET_TAB"; tab: AppState["activeTab"] }
  | { type: "SET_CATEGORY"; category: string }
  | { type: "SELECT_FILTER"; category: string }
  | { type: "ADD_TO_CART"; product: Product }
  | { type: "REMOVE_FROM_CART"; productId: number }
  | { type: "UPDATE_CART_QTY"; productId: number; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_FAVORITE"; productId: number }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: number }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "OPEN_AUTH_SHEET"; intent: AuthIntent }
  | { type: "CLOSE_AUTH_SHEET" }
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "CLEAR_PENDING_INTENT" }
  | { type: "PUSH_NOTIFICATION"; notification: Notification }
  | { type: "OPEN_PENDING_ORDER_SHEET"; orderId: string }
  | { type: "CLOSE_PENDING_ORDER_SHEET" }
  | { type: "PLACE_ORDER"; id: string; claimSlot: string; placedAt: string }
  | { type: "SET_PICKUP_SLOT"; slot: string }
  | { type: "OPEN_ALLERGEN_SHEET"; producto: Product }
  | { type: "CLOSE_ALLERGEN_SHEET" }
  | { type: "OPEN_PAYMENT_SHEET" }
  | { type: "CLOSE_PAYMENT_SHEET" };

/** Generate a fake order id like "#adb323" (3 letters + 3 digits). */
export function createOrderId(): string {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join("");
  const digits = Math.floor(100 + Math.random() * 900);
  return `#${letters}${digits}`;
}

/** Build a 15-minute claim slot starting ~10 minutes from now, e.g. "10:30 – 10:45". */
export function createClaimSlot(now: Date = new Date()): string {
  const start = new Date(now.getTime() + 10 * 60 * 1000);
  const end = new Date(start.getTime() + 15 * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

export const initialState: AppState = {
  activeTab: "home",
  activeCategory: '',
  cart: [],
  favorites: [1, 3, 6, 8, 10],
  notifications: [],
  searchQuery: "",
  user: null,
  authSheetOpen: false,
  pendingIntent: null,
  pendingOrders: [...mockPendingOrders],
  pendingOrderSheetOpen: false,
  selectedPendingOrderId: null,
  selectedPickupSlot: null,
  allergenSheetOpen: false,
  productoSeleccionado: null,
  paymentSheetOpen: false,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_TAB":
      return {
        ...state,
        activeTab: action.tab,
        searchQuery: "",
        // Reset category filter when leaving search
        activeCategory: action.tab !== "search" ? '' : state.activeCategory === '' ? 'all' : state.activeCategory,
      };
    case "SET_CATEGORY":
      return { ...state, activeCategory: action.category };
    case "SELECT_FILTER":
      return { ...state, activeTab: "search", activeCategory: action.category, searchQuery: "" };
    case "ADD_TO_CART": {
      const existing = state.cart.find(
        (item) => item.product.id === action.product.id
      );
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.product, quantity: 1 }],
      };
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.product.id !== action.productId),
      };
    case "UPDATE_CART_QTY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(
            (item) => item.product.id !== action.productId
          ),
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, cart: [] };
    case "TOGGLE_FAVORITE": {
      const isFav = state.favorites.includes(action.productId);
      return {
        ...state,
        favorites: isFav
          ? state.favorites.filter((id) => id !== action.productId)
          : [...state.favorites, action.productId],
      };
    }
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
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };
    case "OPEN_AUTH_SHEET":
      return { ...state, authSheetOpen: true, pendingIntent: action.intent };
    case "CLOSE_AUTH_SHEET":
      return { ...state, authSheetOpen: false };
    case "LOGIN":
      return { ...state, user: action.user, authSheetOpen: false };
    case "LOGOUT":
      return { ...state, user: null, pendingIntent: null };
    case "CLEAR_PENDING_INTENT":
      return { ...state, pendingIntent: null };
    case "PUSH_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };
    case "OPEN_PENDING_ORDER_SHEET":
      return { ...state, pendingOrderSheetOpen: true, selectedPendingOrderId: action.orderId };
    case "CLOSE_PENDING_ORDER_SHEET":
      return { ...state, pendingOrderSheetOpen: false };
    case "SET_PICKUP_SLOT":
      return { ...state, selectedPickupSlot: action.slot };
    case "OPEN_PAYMENT_SHEET":
      return { ...state, paymentSheetOpen: true };
    case "CLOSE_PAYMENT_SHEET":
      return { ...state, paymentSheetOpen: false };
    case "PLACE_ORDER": {
      if (state.cart.length === 0) return state;
      const items = state.cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      }));
      const total = state.cart.reduce((sum, item) => {
        const price = item.product.discount
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price;
        return sum + price * item.quantity;
      }, 0);
      const order: PendingOrder = {
        id: action.id,
        items,
        total,
        claimSlot: action.claimSlot,
        placedAt: action.placedAt,
      };
      return {
        ...state,
        pendingOrders: [order, ...state.pendingOrders],
        cart: [],
        selectedPickupSlot: null,
      };
    }
    case "OPEN_ALLERGEN_SHEET":
      return {
        ...state,
        allergenSheetOpen: true,
        productoSeleccionado: action.producto,
      };

    case "CLOSE_ALLERGEN_SHEET":
      return {
        ...state,
        allergenSheetOpen: false,
        productoSeleccionado: null,
      };
    default:
      return state;
  }
}

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

export function useApp() {
  return useContext(AppContext);
}
