import { useState, useRef, useEffect } from "react";
import { useApp } from "../../store/appStore";
import NotificationBell from "../shared/NotificationBell";
import CategoryFilters from "../CategoryFilters";
import styles from "./TopBar.module.css";

export default function TopBar() {
  const { state, dispatch } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <h1 className={styles.logo}>Cafetería <span>Pío Baroja</span></h1>

        <div className={styles.actions}>
          {/* Notifications — shared component */}
          <NotificationBell
            notifications={state.notifications}
            onMarkRead={(id) => dispatch({ type: "MARK_NOTIFICATION_READ", notificationId: id })}
            onMarkAllRead={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })}
          />

          {/* User Avatar */}
          <div className={styles.iconWrapper} ref={userMenuRef}>
            <button
              className={styles.avatar}
              onClick={() => {
                if (!state.user) {
                  dispatch({ type: "OPEN_AUTH_SHEET", intent: "profile" });
                } else {
                  setShowUserMenu(!showUserMenu);
                }
              }}
              aria-label={state.user ? "Menú de usuario" : "Iniciar sesión"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            {state.user && showUserMenu && (
              <div className={styles.dropdown}>
                <div className={styles.userInfo}>
                  <div className={styles.avatarLg}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <strong>{state.user.name}</strong>
                    <p className={styles.userEmail}>{state.user.email}</p>
                  </div>
                </div>
                <div className={styles.menuList}>
                  <button
                    className={styles.menuItem}
                    onClick={() => {
                      dispatch({ type: "SET_TAB", tab: "profile" });
                      setShowUserMenu(false);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Perfil
                  </button>
                  <button
                    className={styles.menuItem}
                    onClick={() => {
                      dispatch({ type: "SET_TAB", tab: "history" });
                      setShowUserMenu(false);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                    Historial
                  </button>
                  
                  <button className={styles.menuItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Ajustes
                  </button>
                  <hr className={styles.divider} />
                  {(state.user?.role === "staff" || state.user?.role === "admin") && (
                    <button
                      className={styles.menuItem}
                      onClick={() => window.open("/admin", "_blank")}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                      <span>Administracion</span>
                    </button>
                  )}
                  <hr className={styles.divider} />
                  <button
                    className={`${styles.menuItem} ${styles.logout}`}
                    onClick={() => {
                      dispatch({ type: "LOGOUT" });
                      setShowUserMenu(false);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CategoryFilters />
    </header>
  );
}
