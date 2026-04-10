import { useEffect, useRef, useState } from "react";
import { useApp } from "../../store/appStore";
import { isImageUrl } from "../../data/mockData";
import styles from "./CartContent.module.css";

export default function CartContent() {
  const { state, dispatch } = useApp();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    let scroller: HTMLElement | null = el.parentElement;
    while (scroller && getComputedStyle(scroller).overflowY !== "auto") {
      scroller = scroller.parentElement;
    }
    if (!scroller) return;
    const check = () => {
      setAtEnd(
        scroller!.scrollTop + scroller!.clientHeight >=
          scroller!.scrollHeight - 4
      );
    };
    check();
    scroller.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      scroller!.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [state.cart.length]);

  const total = state.cart.reduce((sum, item) => {
    const price = item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  if (state.cart.length === 0) {
    return (
      <div className={styles.emptyWrapper}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🛒</span>
          <p className={styles.emptyTitle}>Tu carrito está vacío</p>
          <p className={styles.emptyHint}>Añade productos desde la página principal</p>
          <button
            className={styles.goHomeBtn}
            onClick={() => dispatch({ type: "SET_TAB", tab: "home" })}
          >
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tu Pedido</h2>
        <button
          className={styles.clearBtn}
          onClick={() => dispatch({ type: "CLEAR_CART" })}
        >
          Vaciar carrito
        </button>
      </div>

      <div className={styles.itemsList}>
        {state.cart.map((item) => {
          const unitPrice = item.product.discount
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price;
          return (
            <div key={item.product.id} className={styles.cartItem}>
              {isImageUrl(item.product.image) ? (
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className={styles.itemImage}
                  loading="lazy"
                />
              ) : (
                <span className={styles.itemEmoji}>{item.product.image}</span>
              )}
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.product.name}</h3>
                <span className={styles.itemPrice}>{unitPrice.toFixed(2)}€</span>
              </div>
              <div className={styles.qtyControls}>
                <button
                  className={styles.qtyBtn}
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_CART_QTY",
                      productId: item.product.id,
                      quantity: item.quantity - 1,
                    })
                  }
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <span className={styles.qtyValue}>{item.quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_CART_QTY",
                      productId: item.product.id,
                      quantity: item.quantity + 1,
                    })
                  }
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
              <span className={styles.lineTotal}>
                {(unitPrice * item.quantity).toFixed(2)}€
              </span>
            </div>
          );
        })}
      </div>

      <div
        ref={summaryRef}
        className={`${styles.summary} ${atEnd ? styles.summaryAtEnd : ""}`}
      >
        <div className={styles.summaryRow}>
          <span>Productos ({itemCount})</span>
          {/* <span>{total.toFixed(2)}€</span> */}
        </div>
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <span>{total.toFixed(2)}€</span>
        </div>
        <button
          className={styles.payBtn}
          onClick={() => {
            if (!state.user) {
              dispatch({ type: "OPEN_AUTH_SHEET", intent: "checkout" });
            } else {
              dispatch({
                type: "PUSH_NOTIFICATION",
                notification: {
                  id: Date.now(),
                  title: "Pedido realizado",
                  message: `¡Gracias, ${state.user.name}! Tu pedido está en camino.`,
                  time: "Ahora",
                  read: false,
                },
              });
              dispatch({ type: "CLEAR_CART" });
              dispatch({ type: "SET_TAB", tab: "home" });
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          {/* Realizar Pedido — {total.toFixed(2)}€ */}
          Realizar Pedido
        </button>
      </div>
    </div>
  );
}
