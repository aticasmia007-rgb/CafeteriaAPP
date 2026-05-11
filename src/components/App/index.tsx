import { useEffect, useReducer } from "react";
import {
  AppContext,
  appReducer,
  initialState,
} from "../../store/appStore";
import {
  getToken,
  getMe,
  getProducts,
  getCategories,
  getAvailableSlots,
  getMyOrders,
  clearTokens,
  mapApiProduct,
  mapApiCategory,
  mapApiOrderToPending,
  mapApiOrderToGroup,
} from "../../services/api";
import TopBar from "../TopBar";
import HomeContent from "../HomeContent";
import SearchContent from "../SearchContent";
import CartContent from "../CartContent";
import BottomNav from "../BottomNav";
import AuthSheet from "../AuthSheet";
import PendingOrderSheet from "../PendingOrderSheet";
import ProductDetailsSheet from "../ProductDetailsSheet";
import PaymentSheet from "../PaymentSheet";
import ProfileView from "../ProfileView";
import HistoryView from "../HistoryView";
import styles from "./App.module.css";

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ── Session restore on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe()
        .then((user) => {
          dispatch({
            type: "LOGIN",
            user: {
              email: user.email,
              name: user.name,
              provider: user.auth_provider?.toLowerCase() === "google" ? "google" : "email",
            },
          });
        })
        .catch(() => clearTokens());
    }
  }, []);

  // ── Catalog + nearest slot loading on mount ───────────────────────────────
  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getAvailableSlots()])
      .then(([apiProducts, apiCategories, apiSlots]) => {
        const products = apiProducts.map(mapApiProduct);
        const categories = [
          { id: "all", name: "Todos", icon: "🍽️" },
          ...apiCategories.filter((c) => c.active).map(mapApiCategory),
        ];
        dispatch({ type: "LOAD_CATALOG", products, categories });

        const available = apiSlots.filter(
          (s) => s.active !== false && (s.remaining ?? 1) > 0
        );
        if (available.length > 0) {
          dispatch({
            type: "SET_PICKUP_SLOT",
            slot: available[0].label,
            slotId: available[0].slot_id,
          });
        }
      })
      .catch(() => {});
  }, []);

  // ── Load user orders when logged in ──────────────────────────────────────
  useEffect(() => {
    if (!state.user) return;
    getMyOrders()
      .then((orders) => {
        const pending = orders.filter((o) =>
          ["pending", "paid", "preparing", "ready"].includes(o.state)
        );
        const history = orders.filter((o) =>
          ["collected", "cancelled"].includes(o.state)
        );
        dispatch({
          type: "SET_PENDING_ORDERS",
          orders: pending.map((o) => mapApiOrderToPending(o, state.products)),
        });
        dispatch({
          type: "SET_RECENT_ORDERS",
          orders: history.map((o) => mapApiOrderToGroup(o, state.products)),
        });
      })
      .catch(() => {
        // Token valid but orders fetch failed — ignore, keep empty
      });
  }, [state.user]);

  // ── Handle Redsys payment return (?order_paid=...) ────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_paid");
    const pickupCode = params.get("pickup_code");
    const slotLabel = params.get("slot");

    if (!orderId) return;

    // Clean URL without navigation
    window.history.replaceState({}, "", window.location.pathname);

    if (!state.user) return;

    const claimSlot = slotLabel ? decodeURIComponent(slotLabel) : "—";
    const displayId = pickupCode ? `#${pickupCode}` : `#${orderId.slice(-6)}`;

    dispatch({
      type: "PLACE_ORDER_FROM_API",
      order: {
        id: displayId,
        items: state.cart.map((i) => ({ product: i.product, quantity: i.quantity })),
        total: state.cart.reduce((sum, i) => {
          const price = i.product.discount
            ? i.product.price * (1 - i.product.discount / 100)
            : i.product.price;
          return sum + price * i.quantity;
        }, 0),
        claimSlot,
        placedAt: "Ahora",
      },
    });
    dispatch({
      type: "PUSH_NOTIFICATION",
      notification: {
        id: Date.now(),
        title: "Pedido confirmado",
        message: `¡Gracias, ${state.user.name}! Tu pedido ${displayId} está confirmado.`,
        time: "Ahora",
        read: false,
      },
    });
    dispatch({ type: "SET_TAB", tab: "home" });
  }, [state.user]);

  // ── Resume the flow that triggered the auth sheet after login ─────────────
  useEffect(() => {
    if (!state.user || !state.pendingIntent) return;
    if (state.pendingIntent === "checkout") {
      dispatch({ type: "SET_TAB", tab: "cart" });
      dispatch({ type: "OPEN_PAYMENT_SHEET" });
    } else if (state.pendingIntent === "profile") {
      dispatch({ type: "SET_TAB", tab: "profile" });
    }
    dispatch({ type: "CLEAR_PENDING_INTENT" });
  }, [state.user, state.pendingIntent]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className={styles.app}>
        <TopBar />
        <main className={styles.main}>
          {state.activeTab === "home" && <HomeContent />}
          {state.activeTab === "search" && <SearchContent />}
          {state.activeTab === "cart" && <CartContent />}
          {state.activeTab === "profile" && <ProfileView />}
          {state.activeTab === "history" && <HistoryView />}
        </main>
        <BottomNav />
        <AuthSheet />
        <PendingOrderSheet />
        <ProductDetailsSheet />
        <PaymentSheet />
      </div>
    </AppContext.Provider>
  );
}
