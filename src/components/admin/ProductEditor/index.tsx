import { useState } from "react";
import { useAdmin } from "../../../store/adminStore";
import { isImageUrl, categories, type Product } from "../../../data/mockData";
import styles from "./ProductEditor.module.css";

const pencilIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

interface Props {
  product: Product | null; // null = new product
}

export default function ProductEditor({ product }: Props) {
  const { dispatch } = useAdmin();
  const isNew = !product;

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [discount, setDiscount] = useState(product?.discount?.toString() ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? "bocadillos");
  const [image, setImage] = useState(product?.image ?? "🍽️");

  function handleSave() {
    const p: Product = {
      id: product?.id ?? 0,
      name,
      price: parseFloat(price) || 0,
      discount: discount ? parseInt(discount, 10) : undefined,
      description,
      category,
      image,
    };
    if (isNew) {
      dispatch({ type: "ADD_PRODUCT", product: p });
    } else {
      dispatch({ type: "UPDATE_PRODUCT", product: p });
    }
  }

  return (
    <div className={styles.editor}>
      <button
        className={styles.backBtn}
        onClick={() => dispatch({ type: "SET_EDITING_PRODUCT", productId: null })}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>

      <div className={styles.layout}>
        {/* Image section */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            {isImageUrl(image) ? (
              <img src={image} alt={name} />
            ) : (
              <span className={styles.mainImageEmoji}>{image}</span>
            )}
          </div>
          <div className={styles.carousel}>
            <div className={`${styles.carouselThumb} ${styles.carouselThumbActive}`}>
              {isImageUrl(image) ? (
                <img src={image} alt="" />
              ) : (
                <span className={styles.carouselEmoji}>{image}</span>
              )}
            </div>
            <div className={styles.carouselThumb}>
              <span className={styles.carouselAdd}>+</span>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {pencilIcon} Nombre
            </label>
            <input
              className={styles.fieldInput}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del producto"
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                {pencilIcon} Precio (€)
              </label>
              <input
                className={styles.fieldInput}
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                {pencilIcon} Descuento (%)
              </label>
              <input
                className={styles.fieldInput}
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {pencilIcon} Descripción
            </label>
            <input
              className={styles.fieldInput}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {pencilIcon} Categoría
            </label>
            <select
              className={styles.fieldSelect}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories
                .filter((c) => c.id !== "all")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {pencilIcon} Imagen (emoji o ruta)
            </label>
            <input
              className={styles.fieldInput}
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="🍽️ o /imagen.jpg"
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.cancelBtn}
              onClick={() => dispatch({ type: "SET_EDITING_PRODUCT", productId: null })}
            >
              Cancelar
            </button>
            <button className={styles.saveBtn} onClick={handleSave}>
              {isNew ? "Crear producto" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
