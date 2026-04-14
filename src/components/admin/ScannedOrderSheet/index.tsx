import { useAdmin } from "../../../store/adminStore";
import type { AdminOrder } from "../../../data/adminMockData";
import type { PendingOrder } from "../../../data/mockData";
import { mockPendingOrders, isImageUrl } from "../../../data/mockData";
import BottomSheet from "../../shared/BottomSheet";
import styles from "./ScannedOrderSheet.module.css";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  prepared: "Preparado",
  delivered: "Entregado",
};

interface Props {
  open: boolean;
  onClose: () => void;
  /** Raw value decoded from the QR */
  scannedValue: string;
}

export default function ScannedOrderSheet({ open, onClose, scannedValue }: Props) {
  const { state, dispatch } = useAdmin();

  // Match by code (case-insensitive) or by id in admin orders
  const adminOrder: AdminOrder | undefined = state.orders.find(
    (o) =>
      o.code.toLowerCase() === scannedValue.toLowerCase() ||
      o.id.toLowerCase() === scannedValue.toLowerCase()
  );

  // Fallback: search static mock orders (test bridge)
  const clientOrder: PendingOrder | undefined = !adminOrder
    ? mockPendingOrders.find(
        (o) => o.id.toLowerCase() === scannedValue.toLowerCase()
      )
    : undefined;

  function markPrepared() {
    if (!adminOrder) return;
    dispatch({ type: "MARK_ORDER_PREPARED", orderId: adminOrder.id });
  }

  function markDelivered() {
    if (!adminOrder) return;
    dispatch({ type: "MARK_ORDER_DELIVERED", orderId: adminOrder.id });
    onClose();
  }

  function markClientDelivered() {
    onClose();
  }

  const badgeClass =
    adminOrder?.status === "pending"
      ? styles.badgePending
      : adminOrder?.status === "prepared"
        ? styles.badgePrepared
        : styles.badgeDelivered;

  return (
    <BottomSheet open={open} onClose={onClose} maxWidth="420px" label="Pedido escaneado">
      {adminOrder ? (
        <>
          {/* Header: code + close */}
          <div className={styles.header}>
            <div>
              <p className={styles.codeLabel}>Pedido</p>
              <p className={styles.code}>{adminOrder.code}</p>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Student + status */}
          <div className={styles.meta}>
            <span className={styles.student}>{adminOrder.studentName}</span>
            <span className={`${styles.statusBadge} ${badgeClass}`}>
              {statusLabels[adminOrder.status]}
            </span>
          </div>

          <span className={styles.time}>{adminOrder.placedAt}</span>

          <div className={styles.divider} />

          {/* Items */}
          <p className={styles.itemsLabel}>Productos</p>
          <div className={styles.items}>
            {adminOrder.items.map((item) => (
              <div key={item.product.id} className={styles.itemRow}>
                <span className={styles.itemName}>{item.product.name}</span>
                <span className={styles.itemQty}>×{item.quantity}</span>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          {/* State actions */}
          <div className={styles.actions}>
            {adminOrder.status === "pending" && (
              <button className={`${styles.actionBtn} ${styles.btnPrepared}`} onClick={markPrepared}>
                Marcar como preparado
              </button>
            )}
            {adminOrder.status === "prepared" && (
              <button className={`${styles.actionBtn} ${styles.btnPrepared} ${styles.btnDone}`}>
                Ya preparado ✓
              </button>
            )}

            {adminOrder.status !== "delivered" ? (
              <button className={`${styles.actionBtn} ${styles.btnDeliver}`} onClick={markDelivered}>
                Confirmar entrega
              </button>
            ) : (
              <button className={`${styles.actionBtn} ${styles.btnDone}`}>
                Entregado ✓
              </button>
            )}
          </div>
        </>
      ) : clientOrder ? (
        <>
          {/* Client order from shared cache */}
          <div className={styles.header}>
            <div>
              <p className={styles.codeLabel}>Pedido (cliente)</p>
              <p className={styles.code}>{clientOrder.id}</p>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className={styles.meta}>
            <span className={styles.student}>Alumno</span>
            <span className={`${styles.statusBadge} ${styles.badgePending}`}>Pendiente</span>
          </div>

          <span className={styles.time}>{clientOrder.placedAt} · Recogida: {clientOrder.claimSlot}</span>

          <div className={styles.divider} />

          <p className={styles.itemsLabel}>Productos</p>
          <div className={styles.items}>
            {clientOrder.items.map((item) => (
              <div key={item.product.id} className={styles.itemRow}>
                {isImageUrl(item.product.image) ? (
                  <img src={item.product.image} alt={item.product.name} className={styles.itemImg} loading="lazy" />
                ) : (
                  <span className={styles.itemEmoji}>{item.product.image}</span>
                )}
                <span className={styles.itemName}>{item.product.name}</span>
                <span className={styles.itemQty}>×{item.quantity}</span>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalAmount}>{clientOrder.total.toFixed(2)} €</span>
          </div>

          <div className={styles.actions}>
            <button className={`${styles.actionBtn} ${styles.btnDeliver}`} onClick={markClientDelivered}>
              Confirmar entrega
            </button>
          </div>
        </>
      ) : (
        /* Order not found */
        <>
          <div className={styles.notFound}>
            <span className={styles.notFoundIcon}>🔍</span>
            <p className={styles.notFoundText}>Pedido no encontrado</p>
            <p className={styles.notFoundCode}>{scannedValue}</p>
          </div>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cerrar
          </button>
        </>
      )}
    </BottomSheet>
  );
}
