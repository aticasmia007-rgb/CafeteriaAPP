import { useEffect, useState } from "react";
import { useApp } from "../../store/appStore";
import { isImageUrl } from "../../data/mockData";
import type { OrderGroup } from "../../data/mockData";
import { getMyOrders, mapApiOrderToGroup } from "../../services/api";
import styles from "./HistoryView.module.css";

export default function HistoryView() {
  const { state, dispatch } = useApp();
  const [orders, setOrders] = useState<(OrderGroup & { total: number; code: string })[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state.user) return;
    setLoading(true);
    getMyOrders()
      .then((apiOrders) => {
        const history = apiOrders
          .filter((o) => ["collected", "cancelled", "paid", "preparing", "ready"].includes(o.state))
          .map((o) => mapApiOrderToGroup(o, state.products));
        setOrders(history);
      })
      .catch(() => {
        // Fall back to state.recentOrders (populated on login) if fetch fails
        setOrders(
          state.recentOrders.map((o) => ({
            ...o,
            total: o.total ?? o.items.reduce((s, i) => s + (i.price ?? 0), 0),
            code: o.code ?? (o.id.slice(-6).toUpperCase()),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [state.user]);

  if (!state.user) {
    return (
      <div className={styles.content}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🧾</span>
          <p className={styles.emptyTitle}>Inicia sesión para ver tu historial</p>
          <button
            className={styles.primaryBtn}
            onClick={() => dispatch({ type: "OPEN_AUTH_SHEET", intent: "profile" })}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  const handleReorder = (order: OrderGroup) => {
    order.items.forEach((p) => dispatch({ type: "ADD_TO_CART", product: p }));
    dispatch({ type: "SET_TAB", tab: "cart" });
  };

  const handleInvoice = (orderId: string) => {
    dispatch({
      type: "PUSH_NOTIFICATION",
      notification: {
        id: Date.now(),
        title: "Factura generada",
        message: `La factura del pedido #${orderId.slice(-10).toUpperCase()} se ha enviado a tu email.`,
        time: "Ahora",
        read: false,
      },
    });
  };

  return (
    <div className={styles.content}>
      <button
        className={styles.backBtn}
        onClick={() => dispatch({ type: "SET_TAB", tab: "profile" })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver
      </button>

      <header className={styles.header}>
        <h2 className={styles.title}>Historial de pedidos</h2>
        <p className={styles.subtitle}>
          {loading ? "Cargando…" : `${orders.length} pedidos realizados`}
        </p>
      </header>

      <div className={styles.list}>
        {orders.map((order) => {
          const total = order.total ?? order.items.reduce((s, i) => {
            const price = i.discount ? i.price * (1 - i.discount / 100) : i.price;
            return s + price;
          }, 0);
          const itemCount = order.items.length;
          return (
            <article key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <span className={styles.orderId}>Pedido #{order.id.slice(-10).toUpperCase()}</span>
                  <span className={styles.orderDate}>{order.date}</span>
                </div>
                <div className={styles.orderAmount}>
                  <span className={styles.amountLabel}>Total</span>
                  <span className={styles.amountValue}>{total.toFixed(2)}€</span>
                </div>
              </div>

              <ul className={styles.items}>
                {order.items.map((item, idx) => {
                  const price = item.discount
                    ? item.price * (1 - item.discount / 100)
                    : item.price;
                  return (
                    <li key={`${item.id}-${idx}`} className={styles.item}>
                      {isImageUrl(item.image) ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.itemImage}
                          loading="lazy"
                        />
                      ) : (
                        <span className={styles.itemEmoji}>{item.image}</span>
                      )}
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemPrice}>{price.toFixed(2)}€</span>
                    </li>
                  );
                })}
              </ul>

              <div className={styles.orderFooter}>
                <span className={styles.itemCount}>{itemCount} producto{itemCount !== 1 ? "s" : ""}</span>
                <div className={styles.actions}>
                  <button
                    className={styles.invoiceBtn}
                    onClick={() => handleInvoice(order.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Factura
                  </button>
                  <button
                    className={styles.reorderBtn}
                    onClick={() => handleReorder(order)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Volver a pedir
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
