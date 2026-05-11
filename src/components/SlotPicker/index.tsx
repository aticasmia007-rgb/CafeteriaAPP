import { useEffect, useState } from "react";
import { useApp } from "../../store/appStore";
import { getAvailableSlots, type ApiSlot } from "../../services/api";
import styles from "./SlotPicker.module.css";

// Fallback static slots when backend is unavailable
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
  const [apiSlots, setApiSlots] = useState<ApiSlot[] | null>(null);

  useEffect(() => {
    getAvailableSlots()
      .then((slots) => {
        const available = slots.filter((s) => s.active !== false && (s.remaining ?? 1) > 0);
        setApiSlots(available.length > 0 ? available : null);
        if (available.length > 0 && !state.selectedPickupSlotId) {
          dispatch({
            type: "SET_PICKUP_SLOT",
            slot: available[0].label,
            slotId: available[0].slot_id,
          });
        }
      })
      .catch(() => setApiSlots(null));
  }, []);

  // Use API slots if available, else fall back to static labels
  const slotOptions: { label: string; id?: string; remaining?: number }[] =
    apiSlots
      ? apiSlots.map((s) => ({
          label: s.label,
          id: s.slot_id,
          remaining: s.remaining,
        }))
      : PICKUP_SLOTS.map((label) => ({ label }));

  // Default to first slot on mount if nothing selected yet
  useEffect(() => {
    if (!state.selectedPickupSlot && slotOptions.length > 0) {
      dispatch({
        type: "SET_PICKUP_SLOT",
        slot: slotOptions[0].label,
        slotId: slotOptions[0].id,
      });
    }
  }, [slotOptions.length]);

  const selected = state.selectedPickupSlot ?? slotOptions[0]?.label ?? "";

  const handleChange = (label: string) => {
    const opt = slotOptions.find((s) => s.label === label);
    dispatch({ type: "SET_PICKUP_SLOT", slot: label, slotId: opt?.id });
  };

  if (compact) {
    return (
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={selected}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Franja de recogida"
        >
          {slotOptions.map((slot) => (
            <option key={slot.label} value={slot.label}>
              {slot.label}
              {slot.remaining !== undefined ? ` (${slot.remaining} libres)` : ""}
            </option>
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
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Selecciona una franja horaria"
        >
          {slotOptions.map((slot) => (
            <option key={slot.label} value={slot.label}>
              {slot.label}
              {slot.remaining !== undefined ? ` (${slot.remaining} libres)` : ""}
            </option>
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
        {slotOptions.map((slot) => {
          const isSelected = selected === slot.label;
          return (
            <button
              key={slot.label}
              className={`${styles.chip} ${isSelected ? styles.chipSelected : ""}`}
              onClick={() => handleChange(slot.label)}
              aria-pressed={isSelected}
            >
              {slot.label}
              {slot.remaining !== undefined && (
                <span className={styles.chipCount}>{slot.remaining}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
