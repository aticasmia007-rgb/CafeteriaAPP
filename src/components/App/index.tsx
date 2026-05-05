import { useEffect, useReducer } from "react";
import {
  AppContext,
  appReducer,
  initialState,
} from "../../store/appStore";
import { notifications as mockNotifications } from "../../data/mockData";
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
import LoginButton from "../LoginButton";
import styles from "./App.module.css";

export default function App() {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    notifications: mockNotifications,
  });

  // Resume the flow that triggered the auth sheet, once the user is logged in.
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
