import { useState } from "react";
import { useAdmin } from "../../../store/adminStore";
import { isImageUrl } from "../../../data/mockData";
import { categories } from "../../../data/mockData";
import ProductEditor from "../ProductEditor";
import styles from "./ProductsView.module.css";

export default function ProductsView() {
  const { state, dispatch } = useAdmin();
  const [catFilter, setCatFilter] = useState("all");

  const recentProducts = state.recentlyEditedIds
    .map((id) => state.products.find((p) => p.id === id))
    .filter(Boolean);

  const filteredProducts =
    catFilter === "all"
      ? state.products
      : state.products.filter((p) => p.categories.includes(catFilter));

  // Group by category for display
  const grouped = categories
    .filter((c) => c.id !== "all")
    .map((cat) => ({
      cat,
      products: filteredProducts.filter((p) => p.categories.includes(cat.id)),
    }))
    .filter((g) => g.products.length > 0);

  if (state.editingProductId !== null) {
    const product =
      state.editingProductId === 0
        ? null // new product
        : state.products.find((p) => p.id === state.editingProductId) ?? null;
    return <ProductEditor product={product} />;
  }

  return (
    <div className={styles.content}>
      <h1 className={styles.title}>Gestión de Productos</h1>

      {/* Recently edited */}
      {recentProducts.length > 0 && (
        <>
          <div className={styles.sectionLabel}>Editados Recientemente</div>
          <div className={styles.recentScroll}>
            {recentProducts.map((p) =>
              p ? (
                <div
                  key={p.id}
                  className={styles.recentCard}
                  onClick={() => dispatch({ type: "SET_EDITING_PRODUCT", productId: p.id })}
                >
                  {isImageUrl(p.image) ? (
                    <img src={p.image} alt={p.name} className={styles.recentImg} loading="lazy" />
                  ) : (
                    <div className={styles.recentImage}>{p.image}</div>
                  )}
                  <div className={styles.recentName}>{p.name}</div>
                  <div className={styles.recentPrice}>{p.price.toFixed(2)} €</div>
                </div>
              ) : null
            )}
          </div>
        </>
      )}

      {/* Category filters */}
      <div className={styles.sectionLabel}>Todos los productos</div>
      <div className={styles.catFilters}>
        <button
          className={`${styles.catBtn} ${catFilter === "all" ? styles.catBtnActive : ""}`}
          onClick={() => setCatFilter("all")}
        >
          Todos
        </button>
        {categories
          .filter((c) => c.id !== "all")
          .map((cat) => (
            <button
              key={cat.id}
              className={`${styles.catBtn} ${catFilter === cat.id ? styles.catBtnActive : ""}`}
              onClick={() => setCatFilter(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
      </div>

      {/* Product listing */}
      {grouped.length === 0 ? (
        <div className={styles.empty}>No hay productos en esta categoría</div>
      ) : (
        grouped.map(({ cat, products }) => (
          <div key={cat.id} className={styles.catGroup}>
            <div className={styles.catGroupTitle}>
              {cat.icon} {cat.name}
            </div>
            <div className={styles.productList}>
              {products.map((p) => (
                <div
                  key={p.id}
                  className={styles.productRow}
                  onClick={() => dispatch({ type: "SET_EDITING_PRODUCT", productId: p.id })}
                >
                  {isImageUrl(p.image) ? (
                    <img src={p.image} alt={p.name} className={styles.productImg} loading="lazy" />
                  ) : (
                    <span className={styles.productEmoji}>{p.image}</span>
                  )}
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.productPrice}>{p.price.toFixed(2)} €</span>
                  <label className={styles.toggle} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className={styles.toggleInput} defaultChecked />
                    <span className={styles.toggleTrack} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* FAB */}
      <button
        className={styles.fab}
        onClick={() => dispatch({ type: "SET_EDITING_PRODUCT", productId: 0 })}
        aria-label="Añadir producto"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
