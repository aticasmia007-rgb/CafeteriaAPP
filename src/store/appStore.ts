// Simple global state using React context + useReducer
import { createContext, useContext } from "react";
import type { Product, Notification } from "../data/mockData";

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
  | { type: "PUSH_NOTIFICATION"; notification: Notification };

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
