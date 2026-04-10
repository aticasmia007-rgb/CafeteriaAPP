import { useState, useRef, useEffect } from "react";
import { useApp } from "../store/appStore";
import { categories, notifications as mockNotifications } from "../data/mockData";
import styles from "./TopBar.module.css";

export default function TopBar() {
  const { state, dispatch } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
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
          {/* Notifications */}
          <div className={styles.iconWrapper} ref={notifRef}>
            <button
              className={styles.iconBtn}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificaciones"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <span>Notificaciones</span>
                  {unreadCount > 0 && (
                    <button
                      className={styles.markAll}
                      onClick={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })}
                    >
                      Marcar todo leído
                    </button>
                  )}
                </div>
                <div className={styles.dropdownList}>
                  {state.notifications.length === 0 ? (
                    <p className={styles.emptyMsg}>No hay notificaciones</p>
                  ) : (
                    state.notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`${styles.notifItem} ${!n.read ? styles.unread : ""}`}
                        onClick={() => dispatch({ type: "MARK_NOTIFICATION_READ", notificationId: n.id })}
                      >
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <span className={styles.notifTime}>{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className={styles.iconWrapper} ref={userMenuRef}>
            <button
              className={styles.avatar}
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Menú de usuario"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            {showUserMenu && (
              <div className={styles.dropdown}>
                <div className={styles.userInfo}>
                  <div className={styles.avatarLg}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Estudiante</strong>
                    <p className={styles.userEmail}>estudiante@iespio.es</p>
                  </div>
                </div>
                <div className={styles.menuList}>
                  <button className={styles.menuItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Perfil
                  </button>
                  <button className={styles.menuItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                    Historial
                  </button>
                  <button className={styles.menuItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Ajustes
                  </button>
                  <hr className={styles.divider} />
                  <button className={`${styles.menuItem} ${styles.logout}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filters */}
      {state.activeTab !== "cart" && (
      <nav className={styles.filters}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.filterBtn} ${state.activeCategory === cat.id ? styles.filterActive : ""}`}
            onClick={() => {
              dispatch({ type: "SET_CATEGORY", category: cat.id });
              if (state.activeTab !== "search") {
                dispatch({ type: "SET_TAB", tab: "search" });
              }
            }}
          >
            <span className={styles.filterIcon}>{cat.icon}</span>
            <span className={styles.filterLabel}>{cat.name}</span>
          </button>
        ))}
      </nav>
      )}
    </header>
  );
}
