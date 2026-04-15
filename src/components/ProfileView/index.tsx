import { useEffect } from "react";
import { useApp } from "../../store/appStore";
import styles from "./ProfileView.module.css";

export default function ProfileView() {
  const { state, dispatch } = useApp();
  const user = state.user;

  useEffect(() => {
    if (!user) {
      dispatch({ type: "SET_TAB", tab: "home" });
    }
  }, [user, dispatch]);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={styles.content}>
      <button
        className={styles.backBtn}
        onClick={() => dispatch({ type: "SET_TAB", tab: "home" })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver
      </button>

      <header className={styles.header}>
        <div className={styles.avatar}>{initials}</div>
        <div>
          <h2 className={styles.name}>{user.name}</h2>
          <p className={styles.email}>{user.email}</p>
          <span className={styles.providerTag}>
            {user.provider === "google" ? "Conectado con Google" : "Cuenta de email"}
          </span>
        </div>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Información personal</h3>
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Nombre</span>
            <span className={styles.rowValue}>{user.name}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Email</span>
            <span className={styles.rowValue}>{user.email}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Centro</span>
            <span className={styles.rowValue}>IES Pío Baroja</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Cuenta</h3>
        <div className={styles.card}>
          <button
            className={styles.menuRow}
            onClick={() => dispatch({ type: "SET_TAB", tab: "history" })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
            <span>Historial de pedidos</span>
            <svg className={styles.chev} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button
            className={styles.menuRow}
            onClick={() => window.open("/admin", "_blank")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
            <span>Administracion</span>
            <svg className={styles.chev} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button
            className={`${styles.menuRow} ${styles.danger}`}
            onClick={() => {
              dispatch({ type: "LOGOUT" });
              dispatch({ type: "SET_TAB", tab: "home" });
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </section>
    </div>
  );
}
