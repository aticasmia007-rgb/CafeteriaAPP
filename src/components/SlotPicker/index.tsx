import { useEffect } from "react";
import { useApp } from "../../store/appStore";
import styles from "./SlotPicker.module.css";

export const PICKUP_SLOTS = [
  "8:00 – 8:50",
  "9:00 – 9:50",
  "10:00 – 10:50",
  "11:00 – 11:50",
  "12:00 – 12:50",
  "13:00 – 13:50",
  "14:00 – 14:50",
];

interface SlotPickerProps {
  /** Renders only the bare <select>, no card wrapper, no header, no chips */
  compact?: boolean;
}

export default function SlotPicker({ compact = false }: SlotPickerProps) {
  const { state, dispatch } = useApp();

  // Default to the first slot on mount if nothing is selected yet
  useEffect(() => {
    if (!state.selectedPickupSlot) {
      dispatch({ type: "SET_PICKUP_SLOT", slot: PICKUP_SLOTS[0] });
    }
  }, []);

  const selected = state.selectedPickupSlot ?? PICKUP_SLOTS[0];

  if (compact) {
    return (
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={selected}
          onChange={(e) => dispatch({ type: "SET_PICKUP_SLOT", slot: e.target.value })}
          aria-label="Franja de recogida"
        >
          {PICKUP_SLOTS.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
        <svg
          className={styles.selectArrow}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    );
  }

  return (
    <div className={styles.slotPicker}>
      <div className={styles.header}>
        <svg
          className={styles.icon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className={styles.title}>Franja de recogida</span>
      </div>

      {/* Mobile: native select dropdown */}
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={selected}
          onChange={(e) => dispatch({ type: "SET_PICKUP_SLOT", slot: e.target.value })}
          aria-label="Selecciona una franja horaria"
        >
          {PICKUP_SLOTS.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
        <svg
          className={styles.selectArrow}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Tablet / Desktop: chip grid */}
      <div className={styles.grid} role="group" aria-label="Selecciona una franja horaria">
        {PICKUP_SLOTS.map((slot) => {
          const isSelected = selected === slot;
          return (
            <button
              key={slot}
              className={`${styles.chip} ${isSelected ? styles.chipSelected : ""}`}
              onClick={() => dispatch({ type: "SET_PICKUP_SLOT", slot })}
              aria-pressed={isSelected}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}
