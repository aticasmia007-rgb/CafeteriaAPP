import { useApp } from "../store/appStore";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const { state, dispatch } = useApp();

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className={styles.nav}>
      {/* Home */}
      <button
        className={`${styles.navBtn} ${state.activeTab === "home" ? styles.active : ""}`}
        onClick={() => dispatch({ type: "SET_TAB", tab: "home" })}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill={state.activeTab === "home" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span className={styles.navLabel}>Inicio</span>
      </button>

      {/* Search */}
      <button
        className={`${styles.navBtn} ${state.activeTab === "search" ? styles.active : ""}`}
        onClick={() => dispatch({ type: "SET_TAB", tab: "search" })}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span className={styles.navLabel}>Buscar</span>
      </button>

      {/* Cart */}
      <button
        className={`${styles.navBtn} ${state.activeTab === "cart" ? styles.active : ""}`}
        onClick={() => dispatch({ type: "SET_TAB", tab: "cart" })}
      >
        <div className={styles.cartIconWrapper}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={state.activeTab === "cart" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && (
            <span className={styles.cartBadge}>{cartCount}</span>
          )}
        </div>
        <span className={styles.navLabel}>Carrito</span>
      </button>
    </nav>
  );
}
