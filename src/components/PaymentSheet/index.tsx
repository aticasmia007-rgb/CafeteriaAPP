import { useState } from "react";
import { createClaimSlot, createOrderId, useApp } from "../../store/appStore";
import BottomSheet from "../shared/BottomSheet";
import styles from "./PaymentSheet.module.css";

export default function PaymentSheet() {
  const { state, dispatch } = useApp();
  const [selected, setSelected] = useState("card");

  const total = state.cart.reduce((sum, item) => {
    const price = item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  function handleConfirm() {
    dispatch({ type: "CLOSE_PAYMENT_SHEET" });
    dispatch({
      type: "PLACE_ORDER",
      id: createOrderId(),
      claimSlot: state.selectedPickupSlot ?? createClaimSlot(),
      placedAt: "Ahora",
    });
    dispatch({
      type: "PUSH_NOTIFICATION",
      notification: {
        id: Date.now(),
        title: "Pedido realizado",
        message: `¡Gracias, ${state.user!.name}! Tu pedido está en camino.`,
        time: "Ahora",
        read: false,
      },
    });
    dispatch({ type: "SET_TAB", tab: "home" });
  }

  return (
    <BottomSheet
      open={state.paymentSheetOpen}
      onClose={() => dispatch({ type: "CLOSE_PAYMENT_SHEET" })}
      label="Método de pago"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Método de pago</h2>
        <button
          className={styles.closeBtn}
          onClick={() => dispatch({ type: "CLOSE_PAYMENT_SHEET" })}
          aria-label="Cerrar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className={styles.methods}>
        <button
          className={`${styles.method} ${selected === "card" ? styles.methodActive : ""}`}
          onClick={() => setSelected("card")}
        >
          <div className={styles.cardVisual}>
            <div className={styles.cardChip} />
            <div className={styles.cardNetwork}>
              <span className={styles.circle} />
              <span className={styles.circle} />
            </div>
            <span className={styles.cardNumber}>•••• 4242</span>
          </div>
          <div className={styles.methodInfo}>
            <span className={styles.methodName}>Tarjeta bancaria</span>
            <span className={styles.methodSub}>terminada en 4242</span>
          </div>
          <span className={`${styles.radio} ${selected === "card" ? styles.radioActive : ""}`}>
            {selected === "card" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </button>
      </div>

      <div className={styles.footer}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total a pagar</span>
          <span className={styles.totalAmount}>{total.toFixed(2)}€</span>
        </div>
        <button className={styles.confirmBtn} onClick={handleConfirm}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Confirmar pago
        </button>
      </div>
    </BottomSheet>
  );
}