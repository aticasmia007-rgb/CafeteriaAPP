import { useReducer } from "react";
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
  timeSlots: mockSlots,
  notifications: adminNotifications,
  user: adminUser,
  searchQuery: "",
  orderFilter: "all",
  expandedOrderId: null,
  editingProductId: null,
  selectedSlotId: null,
  leadTimeMinutes: 30,
  recentlyEditedIds: recentlyEditedProductIds,
};

export default function AdminApp() {
  const [state, dispatch] = useReducer(adminReducer, initialState);

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
