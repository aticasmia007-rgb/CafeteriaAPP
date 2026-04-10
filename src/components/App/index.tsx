import { useReducer } from "react";
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
import styles from "./App.module.css";

export default function App() {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    notifications: mockNotifications,
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className={styles.app}>
        <TopBar />
        <main className={styles.main}>
          {state.activeTab === "home" && <HomeContent />}
          {state.activeTab === "search" && <SearchContent />}
          {state.activeTab === "cart" && <CartContent />}
        </main>
        <BottomNav />
      </div>
    </AppContext.Provider>
  );
}
