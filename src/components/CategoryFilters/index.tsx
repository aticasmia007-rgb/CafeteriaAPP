import { useApp } from "../../store/appStore";
import styles from "./CategoryFilters.module.css";

export default function CategoryFilters() {
  const { state, dispatch } = useApp();

  if (
    state.activeTab === "cart" ||
    state.activeTab === "profile" ||
    state.activeTab === "history"
  ) {
    return null;
  }

  return (
    <nav className={styles.filters}>
      {state.categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.filterBtn} ${state.activeCategory === cat.id ? styles.filterActive : ""}`}
          onClick={() => dispatch({ type: "SELECT_FILTER", category: cat.id })}
        >
          <span className={styles.filterIcon}>{cat.icon}</span>
          <span className={styles.filterLabel}>{cat.name}</span>
        </button>
      ))}
    </nav>
  );
}
