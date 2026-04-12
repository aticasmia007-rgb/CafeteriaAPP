import { useAdmin } from "../../../store/adminStore";
import styles from "./AdminNav.module.css";

export default function AdminNav() {
  const { state, dispatch } = useAdmin();
  const pendingCount = state.orders.filter((o) => o.status !== "delivered").length;

  return (
    <nav className={styles.nav}>
      {/* Orders */}
      <button
        className={`${styles.btn} ${state.activeView === "orders" ? styles.btnActive : ""}`}
        onClick={() => dispatch({ type: "SET_VIEW", view: "orders" })}
        aria-label="Pedidos"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
        {pendingCount > 0 && <span className={styles.badge}>{pendingCount}</span>}
      </button>

      {/* Search */}
      <button
        className={`${styles.searchBtn} ${state.activeView === "search" ? styles.searchBtnActive : ""}`}
        onClick={() => dispatch({ type: "SET_VIEW", view: "search" })}
        aria-label="Buscar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Buscar
      </button>

      {/* Products */}
      <button
        className={`${styles.btn} ${state.activeView === "products" ? styles.btnActive : ""}`}
        onClick={() => dispatch({ type: "SET_VIEW", view: "products" })}
        aria-label="Productos"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </button>

      {/* Time Slots */}
      <button
        className={`${styles.btn} ${state.activeView === "slots" ? styles.btnActive : ""}`}
        onClick={() => dispatch({ type: "SET_VIEW", view: "slots" })}
        aria-label="Tramos horarios"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>
    </nav>
  );
}
