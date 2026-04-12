import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useApp } from "../../store/appStore";
import { isImageUrl } from "../../data/mockData";
import BottomSheet from "../shared/BottomSheet";
import styles from "./PendingOrderSheet.module.css";

export default function PendingOrderSheet() {
  const { state, dispatch } = useApp();

  const open = state.pendingOrderSheetOpen;
  const order = state.pendingOrders.find((o) => o.id === state.selectedPendingOrderId);
  const close = () => dispatch({ type: "CLOSE_PENDING_ORDER_SHEET" });

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <BottomSheet
      open={open && !!order}
      onClose={close}
      maxWidth="440px"
      label={order ? `Pedido ${order.id}` : undefined}
    >
      {order && (
        <>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <p className={styles.headerLabel}>Pedido</p>
              <h2 className={styles.orderId}>{order.id.toUpperCase()}</h2>
            </div>
            <button className={styles.closeBtn} onClick={close} aria-label="Cerrar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* QR */}
          <div className={styles.qrWrap}>
            <QRCodeSVG
              value={order.id}
              size={160}
              fgColor="#1A1811"
              bgColor="transparent"
              className={styles.qr}
              aria-hidden="true"
            />
            <p className={styles.qrHint}>Muestra este código en la cafetería</p>
          </div>

          {/* Claim slot */}
          <div className={styles.slotRow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Recoge entre las <strong>{order.claimSlot}</strong></span>
          </div>

          {/* Items */}
          <div className={styles.items}>
            <p className={styles.itemsLabel}>Resumen del pedido</p>
            <ul className={styles.itemList}>
              {order.items.map(({ product, quantity }) => {
                const unitPrice = product.discount
                  ? product.price * (1 - product.discount / 100)
                  : product.price;
                const lineTotal = unitPrice * quantity;
                return (
                  <li key={product.id} className={styles.item}>
                    <div className={styles.itemImage}>
                      {isImageUrl(product.image) ? (
                        <img src={product.image} alt={product.name} loading="lazy" />
                      ) : (
                        <span className={styles.itemEmoji}>{product.image}</span>
                      )}
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{product.name}</span>
                      <span className={styles.itemQty}>×{quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>
                      {lineTotal.toFixed(2).replace(".", ",")}€
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalAmount}>
                {order.total.toFixed(2).replace(".", ",")}€
              </span>
            </div>
          </div>

          <p className={styles.placedAt}>Pedido realizado {order.placedAt}</p>
        </>
      )}
    </BottomSheet>
  );
}
