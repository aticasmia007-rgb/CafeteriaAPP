import { useAdmin } from "../../../store/adminStore";
import { isImageUrl } from "../../../data/mockData";
import QRScanFab from "../QRScanFab";
import styles from "./AdminSearch.module.css";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  prepared: "Preparado",
  delivered: "Entregado",
};

export default function AdminSearch() {
  const { state, dispatch } = useAdmin();

  const q = state.searchQuery.toLowerCase().trim();

  const matchedOrders = q
    ? state.orders.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.studentName.toLowerCase().includes(q)
      )
    : [];

  const matchedProducts = q
    ? state.products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categories.some((c) => c.toLowerCase().includes(q))
      )
    : [];

  const hasResults = matchedOrders.length > 0 || matchedProducts.length > 0;

  return (
    <>
      <div className={styles.content}>
        <h1 className={styles.title}>Buscar</h1>

        <div className={styles.searchBox}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar pedidos, productos, alumnos..."
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: "SET_SEARCH_QUERY", query: e.target.value })}
            autoFocus
          />
        </div>

        {!q && (
          <div className={styles.hint}>
            Escribe un código de pedido, nombre de alumno o producto para buscar
          </div>
        )}

        {q && !hasResults && (
          <div className={styles.empty}>
            No se encontraron resultados para "{state.searchQuery}"
          </div>
        )}

        {matchedOrders.length > 0 && (
          <>
            <div className={styles.sectionLabel}>Pedidos ({matchedOrders.length})</div>
            <div className={styles.resultsList}>
              {matchedOrders.map((o) => (
                <div
                  key={o.id}
                  className={styles.orderResult}
                  onClick={() => {
                    dispatch({ type: "SET_VIEW", view: "orders" });
                    dispatch({ type: "TOGGLE_ORDER_EXPAND", orderId: o.id });
                  }}
                >
                  <span className={styles.orderCode}>{o.code}</span>
                  <span className={styles.orderStudent}>{o.studentName}</span>
                  <span
                    className={`${styles.orderStatus} ${
                      o.status === "pending"
                        ? styles.statusPending
                        : o.status === "prepared"
                          ? styles.statusPrepared
                          : styles.statusDelivered
                    }`}
                  >
                    {statusLabels[o.status]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {matchedProducts.length > 0 && (
          <>
            <div className={styles.sectionLabel}>Productos ({matchedProducts.length})</div>
            <div className={styles.resultsList}>
              {matchedProducts.map((p) => (
                <div
                  key={p.id}
                  className={styles.productResult}
                  onClick={() => {
                    dispatch({ type: "SET_VIEW", view: "products" });
                    dispatch({ type: "SET_EDITING_PRODUCT", productId: p.id });
                  }}
                >
                  {isImageUrl(p.image) ? (
                    <img src={p.image} alt={p.name} className={styles.productImg} loading="lazy" />
                  ) : (
                    <span className={styles.productEmoji}>{p.image}</span>
                  )}
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.productPrice}>{p.price.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <QRScanFab />
    </>
  );
}
