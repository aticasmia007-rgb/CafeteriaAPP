import { useApp } from "../../store/appStore";
import { products, recentOrders } from "../../data/mockData";
import ProductCard from "../ProductCard";
import RecentOrders from "../RecentOrders";
import styles from "./HomeContent.module.css";

export default function HomeContent() {
  const { state } = useApp();

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

      {recentOrders.length > 0 ? (
        <RecentOrders />
      ) : (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>🍽️</span> Todo lo que tenemos
            </h2>
          </div>
          <div className={styles.horizontalScroll}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
