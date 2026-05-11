import { useEffect, useRef, useState } from "react";
import { useApp } from "../../store/appStore";
import BottomSheet from "../shared/BottomSheet";
import styles from "./PaymentSheet.module.css";
import { createOrder, initiatePayment, submitRedsysForm, ApiError } from "../../services/api";

export default function PaymentSheet() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error state when sheet closes
  useEffect(() => {
    if (!state.paymentSheetOpen) {
      const t = setTimeout(() => {
        setError(null);
        setLoading(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [state.paymentSheetOpen]);

  const total = state.cart.reduce((sum, item) => {
    const price = item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  async function handleConfirm() {
    console.log("Confirming payment...", state);
    if (!state.selectedPickupSlotId) {
      setError("Por favor, selecciona una franja horaria antes de confirmar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Create the order in the backend
      const order = await createOrder(
        state.selectedPickupSlotId,
        state.cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        }))
      );

      // 2. Initiate Redsys payment — get form params
      const redsysParams = await initiatePayment(order.id);

      // 3. Close sheet first to avoid UI flash, then redirect to Redsys
      dispatch({ type: "CLOSE_PAYMENT_SHEET" });
      dispatch({ type: "CLEAR_CART" });

      // 4. Auto-submit Redsys form (browser navigates away)
      submitRedsysForm(redsysParams);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al procesar el pago. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <BottomSheet
      open={state.paymentSheetOpen}
      onClose={loading ? undefined : () => dispatch({ type: "CLOSE_PAYMENT_SHEET" })}
      label="Método de pago"
    >
      <>
        <div className={styles.header}>
          <h2 className={styles.title}>Método de pago</h2>
          <button
            className={styles.closeBtn}
            onClick={() => dispatch({ type: "CLOSE_PAYMENT_SHEET" })}
            disabled={loading}
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.methods}>
          <button className={`${styles.method} ${styles.methodActive}`}>
            <div className={styles.cardVisual}>
              <div className={styles.cardChip} />
              <div className={styles.cardNetwork}>
                <span className={styles.circle} />
                <span className={styles.circle} />
              </div>
              <span className={styles.cardNumber}>TPV Virtual</span>
            </div>
            <div className={styles.methodInfo}>
              <span className={styles.methodName}>Tarjeta bancaria</span>
              <span className={styles.methodSub}>Pago seguro via Redsys</span>
            </div>
            <span className={`${styles.radio} ${styles.radioActive}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </button>
        </div>

        {error && (
          <p className={styles.errorMsg} role="alert">
            {error}
          </p>
        )}

        <div className={styles.footer}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total a pagar</span>
            <span className={styles.totalAmount}>{total.toFixed(2)}€</span>
          </div>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              "Procesando…"
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Confirmar pago
              </>
            )}
          </button>
        </div>
      </>
    </BottomSheet>
  );
}
