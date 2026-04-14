import { useState, useRef, useEffect } from "react";
import styles from "./NotificationBell.module.css";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Props {
  notifications: NotificationItem[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  /** "accent" uses terracota badge, "danger" uses red (default) */
  badgeVariant?: "accent" | "danger";
}

export default function NotificationBell({
  notifications,
  onMarkRead,
  onMarkAllRead,
  badgeVariant = "danger",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.btn}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className={`${styles.badge} ${badgeVariant === "accent" ? styles.badgeAccent : ""}`}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <button className={styles.markAll} onClick={onMarkAllRead}>
                Marcar todo leído
              </button>
            )}
          </div>
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <p className={styles.empty}>No hay notificaciones</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.item} ${!n.read ? styles.itemUnread : ""}`}
                  onClick={() => onMarkRead(n.id)}
                >
                  <span className={styles.itemTitle}>{n.title}</span>
                  <span className={styles.itemMsg}>{n.message}</span>
                  <span className={styles.itemTime}>{n.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
