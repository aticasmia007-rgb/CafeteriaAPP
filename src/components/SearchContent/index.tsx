import { useApp } from "../../store/appStore";
import ProductCard from "../ProductCard";
import styles from "./SearchContent.module.css";

export default function SearchContent() {
  const { state, dispatch } = useApp();

  const filtered = state.products.filter((p) => {
    const matchesQuery =
      state.searchQuery === "" ||
      p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesCategory =
      state.activeCategory === "all" || p.categories.includes(state.activeCategory);
    return matchesQuery && matchesCategory;
  });

  return (
    <div className={styles.content}>
      <div className={styles.searchBar}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={styles.searchIcon}>
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={state.searchQuery}
          onChange={(e) => dispatch({ type: "SET_SEARCH_QUERY", query: e.target.value })}
          className={styles.searchInput}
          autoFocus
        />
        {state.searchQuery && (
          <button
            className={styles.clearBtn}
            onClick={() => dispatch({ type: "SET_SEARCH_QUERY", query: "" })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <p className={styles.resultCount}>
        {filtered.length} producto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔍</span>
          <p>No se encontraron productos</p>
          <p className={styles.emptyHint}>Prueba con otro término de búsqueda</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
