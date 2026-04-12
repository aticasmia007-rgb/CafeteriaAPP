import { useAdmin } from "../../../store/adminStore";
import OrderCard from "../OrderCard";
import styles from "./OrdersView.module.css";

export default function OrdersView() {
  const { state, dispatch } = useAdmin();

  const filteredOrders =
    state.orderFilter === "needs-prep"
      ? state.orders.filter((o) => o.needsPrep)
      : state.orderFilter === "pending"
        ? state.orders.filter((o) => o.status !== "delivered")
        : state.orders;

  // Group by time slot, preserving slot order
  const grouped = state.timeSlots
    .map((slot) => ({
      slot,
      orders: filteredOrders.filter((o) => o.timeSlotId === slot.id),
    }))
    .filter((g) => g.orders.length > 0);

  return (
    <div className={styles.content}>
      <h1 className={styles.title}>Pedidos Realizados</h1>

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${state.orderFilter === "all" ? styles.filterBtnActive : ""}`}
          onClick={() => dispatch({ type: "SET_ORDER_FILTER", filter: "all" })}
        >
          Todos
        </button>
        <button
          className={`${styles.filterBtn} ${state.orderFilter === "pending" ? styles.filterBtnActive : ""}`}
          onClick={() => dispatch({ type: "SET_ORDER_FILTER", filter: "pending" })}
        >
          Pendientes
        </button>
        <button
          className={`${styles.filterBtn} ${state.orderFilter === "needs-prep" ? styles.filterBtnActive : ""}`}
          onClick={() => dispatch({ type: "SET_ORDER_FILTER", filter: "needs-prep" })}
        >
          🔥 Necesitan preparación
        </button>
      </div>

      {grouped.length === 0 ? (
        <div className={styles.empty}>No hay pedidos que coincidan con el filtro</div>
      ) : (
        grouped.map(({ slot, orders }) => (
          <div key={slot.id} className={styles.slotGroup}>
            <div className={styles.slotHeader}>
              <span className={styles.slotName}>{slot.name}</span>
              <span className={styles.slotTime}>
                {slot.startTime} – {slot.endTime}
              </span>
              <span className={styles.slotCount}>{orders.length} pedidos</span>
            </div>
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
