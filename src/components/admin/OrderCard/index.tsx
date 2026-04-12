import { useState } from "react";
import type { AdminOrder } from "../../../data/adminMockData";
import { useAdmin } from "../../../store/adminStore";
import BottomSheet from "../../shared/BottomSheet";
import styles from "./OrderCard.module.css";

interface Props {
  order: AdminOrder;
}

function DeliverConfirmModal({
  order,
  onConfirm,
  onCancel,
}: {
  order: AdminOrder;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <BottomSheet open onClose={onCancel} maxWidth="360px" label="Confirmar entrega">
      <p className={styles.confirmLabel}>Confirmar entrega</p>
      <div className={styles.confirmCode}>{order.code}</div>
      <div className={styles.confirmStudent}>{order.studentName}</div>
      <div className={styles.confirmTime}>{order.placedAt}</div>

      <div className={styles.confirmItems}>
        {order.items.map((item) => (
          <div key={item.product.id} className={styles.confirmRow}>
            <span className={styles.confirmProduct}>{item.product.name}</span>
            <span className={styles.confirmQty}>×{item.quantity}</span>
          </div>
        ))}
      </div>

      <div className={styles.confirmActions}>
        <button className={styles.confirmCancelBtn} onClick={onCancel}>
          Cancelar
        </button>
        <button className={styles.confirmDeliverBtn} onClick={onConfirm}>
          Confirmar entrega
        </button>
      </div>
    </BottomSheet>
  );
}

export default function OrderCard({ order }: Props) {
  const { state, dispatch } = useAdmin();
  const isExpanded = state.expandedOrderId === order.id;
  const [showConfirm, setShowConfirm] = useState(false);

  const statusClass =
    order.status === "pending"
      ? styles.cardPending
      : order.status === "prepared"
        ? styles.cardPrepared
        : styles.cardDelivered;

  return (
    <div className={styles.card}>
      <div
        className={`${styles.cardCompact} ${statusClass}`}
        onClick={() => dispatch({ type: "TOGGLE_ORDER_EXPAND", orderId: order.id })}
      >
        {/* Expand arrow */}
        <span className={`${styles.expandBtn} ${isExpanded ? styles.expandBtnOpen : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>

        {/* Info */}
        <div className={styles.info}>
          <span className={styles.code}>{order.code}</span>
          <div className={styles.studentRow}>
            <span className={styles.studentName}>{order.studentName}</span>
            {order.needsPrep && (
              <span className={styles.prepIcon} title="Necesita preparación">🔥</span>
            )}
          </div>
          <span className={styles.time}>{order.placedAt}</span>
        </div>

        {/* Deliver button */}
        {order.status !== "delivered" ? (
          <button
            className={`${styles.deliverBtn} ${styles.deliverBtnGreen}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
          >
            Entregado
          </button>
        ) : (
          <span className={`${styles.deliverBtn} ${styles.deliverBtnDone}`}>
            Entregado
          </span>
        )}
      </div>

      {/* Accordion detail */}
      <div className={`${styles.detail} ${isExpanded ? styles.detailOpen : ""}`}>
        <div className={styles.detailItems}>
          {order.items.map((item) => (
            <div key={item.product.id} className={styles.detailRow}>
              <span className={styles.detailProduct}>{item.product.name}</span>
              <span className={styles.detailQty}>x{item.quantity}</span>
            </div>
          ))}
        </div>

        {order.status === "pending" && (
          <button
            className={styles.preparedBtn}
            onClick={() => dispatch({ type: "MARK_ORDER_PREPARED", orderId: order.id })}
          >
            Preparado
          </button>
        )}
        {order.status === "prepared" && (
          <button className={`${styles.preparedBtn} ${styles.preparedBtnDone}`}>
            Ya preparado
          </button>
        )}
      </div>

      {/* Delivery confirmation modal */}
      {showConfirm && (
        <DeliverConfirmModal
          order={order}
          onConfirm={() => {
            dispatch({ type: "MARK_ORDER_DELIVERED", orderId: order.id });
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
