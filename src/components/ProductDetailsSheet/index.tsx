import { useApp } from "../../store/appStore";
import BottomSheet from "../shared/BottomSheet";
import { isImageUrl } from "../../data/mockData";
import { ALLERGENS } from "../../data/mockData";
import styles from "./ProductDetailsSheet.module.css";

export default function AlergenosSheet() {
  const { state, dispatch } = useApp();

  const open = state.allergenSheetOpen;
  const producto = state.productoSeleccionado;

  const close = () => dispatch({ type: "CLOSE_ALLERGEN_SHEET" });

  if (!producto) return null;

  const cartItem = state.cart.find((i) => i.product.id === producto.id);
  const quantity = cartItem?.quantity ?? 0;

  const discountedPrice = producto.discount
    ? producto.price * (1 - producto.discount / 100)
    : null;

  return (
    <BottomSheet open={open} onClose={close} maxWidth="440px">
       {/* Botón X */}
    <div className={styles.header}>
        <h2 className={styles.name}>{producto.name}</h2>
        <button className={styles.closeBtn} onClick={close} aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className={styles.container}>

       
        {/* Imagen */}
        <div className={styles.imageArea}>
          {isImageUrl(producto.image) ? (
            <img src={producto.image} alt={producto.name} className={styles.image} />
          ) : (
            <span className={styles.emoji}>{producto.image}</span>
          )}

          {producto.discount && (
            <span className={styles.discountBadge}>-{producto.discount}%</span>
          )}
        </div>

        {/* Nombre + descripción */}
        {/*<h2 className={styles.name}>{producto.name}</h2>*/}
        <p className={styles.desc}>{producto.description}</p>

        {/* Precio */}
        <div className={styles.priceRow}>
          {discountedPrice !== null ? (
            <>
              <span className={styles.priceOld}>{producto.price.toFixed(2)}€</span>
              <span className={styles.priceNew}>{discountedPrice.toFixed(2)}€</span>
            </>
          ) : (
            <span className={styles.priceNew}>{producto.price.toFixed(2)}€</span>
          )}
        </div>

        {/* Contador */}
        <div className={styles.qtyGroup}>
          <button
            className={styles.qtyBtn}
            onClick={() =>
              dispatch({
                type: "UPDATE_CART_QTY",
                productId: producto.id,
                quantity: quantity - 1,
              })
            }
            disabled={quantity === 0}
          >
            –
          </button>

          <span className={styles.qtyValue}>{quantity}</span>

          <button
            className={styles.qtyBtn}
            onClick={() => dispatch({ type: "ADD_TO_CART", product: producto })}
          >
            +
          </button>
        </div>

        {/* Alergenos */}
        <h3 className={styles.subTitle}>Alérgenos</h3>

        <div className={styles.allergenChips}>
                {producto.allergens?.length ? (
                producto.allergens.map((id) => {
                const info = ALLERGENS.find(a => a.id === id);
                return (
                    <span key={id} className={styles.chip}>
                        {info?.icon} {info?.label}
                    </span>
                );
                })
            ) : (
                <span className={styles.noAllergens}>No contiene alérgenos</span>
            )}
        </div>


      </div>
    </BottomSheet>
  );
}