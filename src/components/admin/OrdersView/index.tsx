import { useAdmin } from "../../../store/adminStore";
import { type TimeSlot } from "../../../data/adminMockData";
import OrderCard from "../OrderCard";
import styles from "./OrdersView.module.css";

function getCurrentSlotId(timeSlots: TimeSlot[]): string | null {
  const now = new Date();
  
  const current = now.getHours() * 60 + now.getMinutes();
  const slot = timeSlots.find((s) => {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
  
    return current >= sh * 60 + sm && current <= eh * 60 + em;
  });
 
  return slot?.id ?? null;
}

export default function OrdersView() {
  const { state, dispatch } = useAdmin();
  const currentSlotId = getCurrentSlotId(state.timeSlots);  
  const filteredOrders =
    state.orderFilter === "needs-prep"
      ? state.orders.filter((o) => o.needsPrep)
      : state.orderFilter === "pending"
        ? state.orders.filter((o) => o.status !== "delivered")
        : state.orderFilter === "current-slot"
          ? state.orders.filter((o) => o.timeSlotId === currentSlotId)
          : state.orders;

  // Group by time slot, preserving slot order
  const visibleSlots = state.orderFilter === "current-slot"
    ? state.timeSlots.filter((s) => s.id === currentSlotId)
    : state.timeSlots;

  const grouped = visibleSlots.map((slot) => ({
    slot,
    orders: filteredOrders.filter((o) => o.timeSlotId === slot.id),
  }));

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
        <button
          className={`${styles.filterBtn} ${state.orderFilter === "current-slot" ? styles.filterBtnActive : ""}`}
          onClick={() => dispatch({ type: "SET_ORDER_FILTER", filter: "current-slot" })}
          disabled={currentSlotId === null}
          title={currentSlotId === null ? "No hay tramo activo ahora mismo" : undefined}
        >
          🕐 Tramo actual
        </button>
      </div>

      {grouped.map(({ slot, orders }) => (
        <div key={slot.id} className={styles.slotGroup}>
          <div className={styles.slotHeader}>
            {slot.id === currentSlotId && (
              <span className={styles.liveDot} aria-label="Tramo activo" />
            )}
            <span className={styles.slotName}>{slot.name}</span>
            <span className={styles.slotTime}>
              {slot.startTime} – {slot.endTime}
            </span>
            <span className={styles.slotCount}>{orders.length} pedidos</span>
          </div>
          {orders.length === 0 ? (
            <div className={styles.slotEmpty}>Sin pedidos en este tramo</div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
