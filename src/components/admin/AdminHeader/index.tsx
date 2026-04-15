import { useState, useRef, useEffect } from "react";
import { useAdmin } from "../../../store/adminStore";
import NotificationBell from "../../shared/NotificationBell";
import styles from "./AdminHeader.module.css";

export default function AdminHeader() {
  const { state, dispatch } = useAdmin();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className={styles.header}>
      <span className={styles.title}>Panel Admin</span>

      <div className={styles.actions}>
        <NotificationBell
          notifications={state.notifications}
          onMarkRead={(id) => dispatch({ type: "MARK_NOTIFICATION_READ", notificationId: id })}
          onMarkAllRead={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })}
          badgeVariant="accent"
        />

        <div className={styles.avatarWrap} ref={dropRef}>
          <button
            className={styles.avatarBtn}
            onClick={() => setShowDropdown((v) => !v)}
            aria-label="Menú de usuario"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          {showDropdown && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Perfil
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => window.open("/", "")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                <span>App Cliente</span>
              </button>
              <a href="/admin/logout" className={`${styles.dropdownItem} ${styles.dropdownDanger}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Cerrar sesión
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
