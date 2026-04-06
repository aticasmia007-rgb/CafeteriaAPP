import { useApp } from "../store/appStore";
import type { Product } from "../data/mockData";
import styles from "./ProductCard.module.css";

interface Props {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: Props) {
  const { state, dispatch } = useApp();
  const isFav = state.favorites.includes(product.id);
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : null;

  return (
    <div className={`${styles.card} ${compact ? styles.compact : ""}`}>
      <div className={styles.imageArea}>
        <span className={styles.emoji}>{product.image}</span>
        {product.discount && (
          <span className={styles.discountBadge}>-{product.discount}%</span>
        )}
        <button
          className={`${styles.favBtn} ${isFav ? styles.favActive : ""}`}
          onClick={() => dispatch({ type: "TOGGLE_FAVORITE", productId: product.id })}
          aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? "var(--color-danger)" : "none"} stroke={isFav ? "var(--color-danger)" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        {!compact && <p className={styles.desc}>{product.description}</p>}
        <div className={styles.priceRow}>
          <div className={styles.prices}>
            {discountedPrice !== null ? (
              <>
                <span className={styles.priceOld}>{product.price.toFixed(2)}€</span>
                <span className={styles.price}>{discountedPrice.toFixed(2)}€</span>
              </>
            ) : (
              <span className={styles.price}>{product.price.toFixed(2)}€</span>
            )}
          </div>
          <button
            className={styles.addBtn}
            onClick={() => dispatch({ type: "ADD_TO_CART", product })}
            aria-label="Añadir al carrito"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
