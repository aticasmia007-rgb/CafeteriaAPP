import { useState, type Dispatch } from "react";
import { useAdmin } from "../../../store/adminStore";
import { isImageUrl } from "../../../data/mockData";
import { updateProduct as updateProductApi } from "../../../services/api";
import ChipIcon from "../../shared/ChipIcon";
import ProductEditor from "../ProductEditor";
import type { Product } from "../../../data/mockData";
import type { AdminAction } from "../../../store/adminStore";
import styles from "./ProductsView.module.css";

function ProductRow({ p, dispatch }: { p: Product; dispatch: Dispatch<AdminAction> }) {
  const isAvailable = p.available ?? true;

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const next = !isAvailable;
    dispatch({ type: "TOGGLE_PRODUCT_AVAILABLE", productId: p.id });
    updateProductApi(p.id, { available: next }).catch(() => {
      dispatch({ type: "TOGGLE_PRODUCT_AVAILABLE", productId: p.id });
    });
  }

  return (
    <div
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
      <label className={styles.toggle} onClick={handleToggle}>
        <input type="checkbox" className={styles.toggleInput} checked={isAvailable} readOnly />
        <span className={styles.toggleTrack} />
      </label>
    </div>
  );
}

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

  // Group by category using backend categories; collect ungrouped products separately
  const displayCategories = state.categories.length > 0 ? state.categories : [];
  const groupedCatIds = new Set(displayCategories.map((c) => c.id));

  const grouped = displayCategories
    .map((cat) => ({
      cat,
      products: filteredProducts.filter((p) => p.categories.includes(cat.id)),
    }))
    .filter((g) => g.products.length > 0);

  const ungrouped = filteredProducts.filter(
    (p) => p.categories.length === 0 || !p.categories.some((id) => groupedCatIds.has(id))
  );

  if (state.editingProductId !== null) {
    const product =
      state.editingProductId === "new"
        ? null
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
        {displayCategories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.catBtn} ${catFilter === cat.id ? styles.catBtnActive : ""}`}
            onClick={() => setCatFilter(cat.id)}
          >
            <ChipIcon icon={cat.icon} name={cat.name} size={16} /> {cat.name}
          </button>
        ))}
      </div>

      {/* Product listing */}
      {grouped.length === 0 && ungrouped.length === 0 ? (
        <div className={styles.empty}>No hay productos en esta categoría</div>
      ) : (
        <>
          {grouped.map(({ cat, products }) => (
            <div key={cat.id} className={styles.catGroup}>
              <div className={styles.catGroupTitle}>
                <ChipIcon icon={cat.icon} name={cat.name} size={16} /> {cat.name}
              </div>
              <div className={styles.productList}>
                {products.map((p) => (
                  <ProductRow key={p.id} p={p} dispatch={dispatch} />
                ))}
              </div>
            </div>
          ))}
          {ungrouped.length > 0 && (
            <div className={styles.catGroup}>
              <div className={styles.catGroupTitle}>🍽️ Sin categoría</div>
              <div className={styles.productList}>
                {ungrouped.map((p) => (
                  <ProductRow key={p.id} p={p} dispatch={dispatch} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* FAB */}
      <button
        className={styles.fab}
        onClick={() => dispatch({ type: "SET_EDITING_PRODUCT", productId: "new" })}
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
