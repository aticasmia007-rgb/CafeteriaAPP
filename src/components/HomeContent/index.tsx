import { useApp } from "../../store/appStore";
import { isImageUrl, products, recentOrders } from "../../data/mockData";
import ProductCard from "../ProductCard";
import styles from "./HomeContent.module.css";

export default function HomeContent() {
  const { state, dispatch } = useApp();

  const recommended = products.filter((p) => p.discount);
  const favorites = products.filter((p) => state.favorites.includes(p.id));

  return (
    <div className={styles.content}>
      {/* Recomendados */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}>⭐</span> Recomendados
          </h2>
        </div>
        <div className={styles.horizontalScroll}>
          {recommended.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Favoritos */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}>❤️</span> Tus Favoritos
          </h2>
        </div>
        {favorites.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Aún no tienes favoritos. Toca el corazón en un producto para añadirlo.</p>
          </div>
        ) : (
          <div className={styles.horizontalScroll}>
            {favorites.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        )}
      </section>

      {/* Pedidos Recientes */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleIcon}>🕐</span> Pedidos Recientes
          </h2>
        </div>
        <div className={styles.ordersList}>
          {recentOrders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderDate}>{order.date}</span>
                <span className={styles.orderTotal}>
                  {order.items.reduce((sum, item) => {
                    const price = item.discount
                      ? item.price * (1 - item.discount / 100)
                      : item.price;
                    return sum + price;
                  }, 0).toFixed(2)}€
                </span>
              </div>
              <div className={styles.orderItems}>
                {order.items.map((item) => {
                  const cartItem = state.cart.find((c) => c.product.id === item.id);
                  const inCart = cartItem !== undefined;
                  return (
                    <div key={item.id} className={styles.orderItem}>
                      {isImageUrl(item.image) ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.orderItemImage}
                          loading="lazy"
                        />
                      ) : (
                        <span className={styles.orderItemEmoji}>{item.image}</span>
                      )}
                      <span className={styles.orderItemName}>{item.name}</span>
                      <div className={`${styles.reorderGroup} ${inCart ? styles.reorderGroupActive : ""}`}>
                        {inCart && (
                          <>
                            <button
                              className={styles.reorderQtyBtn}
                              onClick={() =>
                                dispatch({
                                  type: "UPDATE_CART_QTY",
                                  productId: item.id,
                                  quantity: cartItem!.quantity - 1,
                                })
                              }
                              title="Quitar uno"
                              aria-label="Quitar uno del carrito"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                              </svg>
                            </button>
                            <span className={styles.reorderQtyValue}>{cartItem!.quantity}</span>
                          </>
                        )}
                        <button
                          className={styles.reorderBtn}
                          onClick={() => dispatch({ type: "ADD_TO_CART", product: item })}
                          title="Volver a pedir"
                          aria-label="Añadir al carrito"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
