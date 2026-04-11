import { useApp } from "../../store/appStore";
import styles from "./PendingOrders.module.css";

export default function PendingOrders() {
  const { state, dispatch } = useApp();

  if (state.pendingOrders.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.dot} aria-hidden="true" />
          Por recoger
        </h2>
      </div>
      <ul className={styles.list}>
        {state.pendingOrders.map((order) => (
          <li key={order.id}>
            <button
              className={styles.card}
              onClick={() =>
                dispatch({ type: "OPEN_PENDING_ORDER_SHEET", orderId: order.id })
              }
              aria-label={`Ver pedido ${order.id}`}
            >
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.orderId}>{order.id}</span>
                  <span className={styles.slotBadge}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {order.claimSlot}
                  </span>
                </div>
                <p className={styles.cardSub}>
                  {order.items
                    .map((i) => `${i.product.name} ×${i.quantity}`)
                    .join(", ")}
                  <span className={styles.totalInline}>
                    {" "}· {order.total.toFixed(2).replace(".", ",")}€
                  </span>
                </p>
              </div>
              <svg
                className={styles.chevron}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
