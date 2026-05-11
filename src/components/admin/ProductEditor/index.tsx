import { useState, useRef } from "react";
import { useAdmin } from "../../../store/adminStore";
import { isImageUrl, type Product } from "../../../data/mockData";
import { createProduct, updateProduct as updateProductApi, mapApiProduct } from "../../../services/api";
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
  const { state, dispatch } = useAdmin();
  const isNew = !product;

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(product?.categories ?? []);
  const [image, setImage] = useState(product?.image ?? "🍽️");
  const [allergens, setAllergens] = useState<string[]>(product?.allergens ?? []);
  const [requiresPreparation, setRequiresPreparation] = useState(product?.requiresPreparation ?? false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleAllergen(id: string) {
    setAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function resolveAllergenIds(): string[] {
    return allergens; // UUID strings from state.allergens
  }

  async function handleSave() {
    const localProduct: Product = {
      id: product?.id ?? "",
      name,
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      description,
      categories: selectedCategories,
      image,
      requiresPreparation: requiresPreparation || undefined,
      allergens: allergens.length > 0 ? allergens : undefined,
    };

    setSaving(true);
    try {
      const apiPayload = {
        name,
        description,
        price: parseFloat(price) || 0,
        image: image.startsWith("/") || image.startsWith("http") ? image : undefined,
        available: true,
        stock: parseInt(stock, 10) || 0,
        prepare_required: requiresPreparation,
        category: selectedCategories,
        allergens: resolveAllergenIds(),
      };

      if (isNew) {
        const { id } = await createProduct(apiPayload);
        dispatch({ type: "ADD_PRODUCT", product: { ...localProduct, id } });
      } else {
        await updateProductApi(product!.id, apiPayload);
        dispatch({ type: "UPDATE_PRODUCT", product: { ...localProduct, id: product!.id } });
      }
    } catch {
      // API unavailable (e.g. no admin JWT yet) — update UI optimistically
      if (isNew) {
        dispatch({ type: "ADD_PRODUCT", product: { ...localProduct, id: `new-${Date.now()}` } });
      } else {
        dispatch({ type: "UPDATE_PRODUCT", product: localProduct });
      }
    } finally {
      setSaving(false);
    }
  }

  const handleCameraClick = () => {
    // 2. DISPARAR EL CLICK DEL INPUT OCULTO
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Por ahora guardamos el nombre, pero aquí podrías subirlo a un servidor
      setImage(file.name); 
    }
  };

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
                {pencilIcon} Stock
              </label>
              <input
                className={styles.fieldInput}
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
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
              {pencilIcon} Categorías
            </label>
            <div className={styles.allergenGrid}>
              {state.categories.map((c) => {
                const active = selectedCategories.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.allergenChip} ${active ? styles.allergenChipActive : ""}`}
                    onClick={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(c.id)
                          ? prev.filter((id) => id !== c.id)
                          : [...prev, c.id]
                      )
                    }
                  >
                    <span className={styles.allergenIcon}>{c.icon}</span>
                    <span className={styles.allergenLabel}>{c.name}</span>
                  </button>
                );
              })}
              {state.categories.length === 0 && (
                <span style={{ fontSize: "13px", opacity: 0.5 }}>Cargando categorías…</span>
              )}
            </div>
          </div>


             
          <button
            type="button"
            className={`${styles.prepToggle} ${requiresPreparation ? styles.prepToggleActive : ""}`}
            onClick={() => setRequiresPreparation((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 19h12v2H6z"/>
              <path d="M7 19v-3h10v3"/>
              <path d="M7 16a5 5 0 1 1 10 0"/>
            </svg>
            <span>Requiere preparación</span>
            <span className={styles.prepBadge}>{requiresPreparation ? "Sí" : "No"}</span>
          </button>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {pencilIcon} Alérgenos
            </label>
            <div className={styles.allergenGrid}>
              {state.allergens.map((a) => {
                const active = allergens.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`${styles.allergenChip} ${active ? styles.allergenChipActive : ""}`}
                    onClick={() => toggleAllergen(a.id)}
                  >
                    <span className={styles.allergenIcon}>{a.icon}</span>
                    <span className={styles.allergenLabel}>{a.name}</span>
                  </button>
                );
              })}
              {state.allergens.length === 0 && (
                <span style={{ fontSize: "13px", opacity: 0.5 }}>Cargando alérgenos…</span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {pencilIcon} Imagen (emoji o ruta)
              <button  //boton para activar camara
                type="button" 
                onClick={handleCameraClick}
                className={styles.cameraBtn} 
                style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                📸 Usar Cámara
              </button>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="cámara o /imagen.jpg"
                />

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.cancelBtn}
              onClick={() => dispatch({ type: "SET_EDITING_PRODUCT", productId: null })}
            >
              Cancelar
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : isNew ? "Crear producto" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
