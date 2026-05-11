import { useState, useEffect } from "react";
import { useAdmin } from "../../../store/adminStore";
import type { TimeSlot } from "../../../data/adminMockData";
import BottomSheet from "../../shared/BottomSheet";
import styles from "./SlotModal.module.css";
import { updateSlot } from "../../../services/api";

export default function SlotModal() {
  const { state, dispatch } = useAdmin();
  const open = state.selectedSlotId !== null;
  const slot = state.timeSlots.find((s) => s.id === state.selectedSlotId);

  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxOrders, setMaxOrders] = useState("0");
  const [blocked, setBlocked] = useState(false);
  const [notified, setNotified] = useState(false);

  // Sync form fields when a slot is selected
  useEffect(() => {
    if (open && slot) {
      setName(slot.name);
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
      setMaxOrders(slot.maxOrders.toString());
      setBlocked(slot.blocked);
      setNotified(false);
    }
  }, [open, state.selectedSlotId]);

  const close = () => dispatch({ type: "SELECT_SLOT", slotId: null });

  function handleSave() {
    const updated: TimeSlot = {
      id: slot!.id,
      name,
      startTime,
      endTime,
      maxOrders: parseInt(maxOrders, 10) || slot!.maxOrders,
      blocked,
      currentOrders: slot!.currentOrders,
    };
    dispatch({ type: "UPDATE_SLOT", slot: updated });
    updateSlot(slot!.id, {
      capacity: updated.maxOrders,
      active: !updated.blocked,
    }).catch(() => {});
  }

  function handleNotify() {
    setNotified(true);
    dispatch({
      type: "PUSH_NOTIFICATION",
      notification: {
        id: Date.now(),
        title: "Aviso enviado",
        message: `Notificación de bloqueo enviada para "${name}"`,
        time: "Ahora",
        read: false,
      },
    });
  }

  return (
    <BottomSheet open={open && !!slot} onClose={close} maxWidth="520px" label="Editar tramo horario">
      {slot && (
        <>
          {/* Top row: name + time picker */}
          <div className={styles.topRow}>
            <div className={styles.nameGroup}>
              <span className={styles.nameLabel}>Nombre del tramo</span>
              <input
                className={styles.nameInput}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.timeGroup}>
              <span className={styles.timeLabel}>Horario</span>
              <div className={styles.timeRow}>
                <input
                  className={styles.timeInput}
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <span className={styles.timeSep}>–</span>
                <input
                  className={styles.timeInput}
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Limit */}
          <div className={styles.limitGroup}>
            <div className={styles.limitLabel}>
              <span className={styles.limitTitle}>Límite de pedidos</span>
              <span className={styles.limitCurrent}>
                Actuales: {slot.currentOrders} / {slot.maxOrders}
              </span>
            </div>
            <input
              className={styles.limitInput}
              type="number"
              min="0"
              value={maxOrders}
              onChange={(e) => setMaxOrders(e.target.value)}
            />
          </div>

          {/* Block & Notify */}
          <div className={styles.actionRow}>
            <button
              className={`${styles.blockBtn} ${blocked ? styles.blockBtnBlocked : ""}`}
              onClick={() => setBlocked(!blocked)}
            >
              {blocked ? "🔓 Desbloquear" : "🚫 Bloquear tramo"}
            </button>
            <button
              className={styles.notifyBtn}
              onClick={handleNotify}
              disabled={notified}
            >
              {notified ? "✓ Enviado" : "📢 Avisar"}
            </button>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={close}>
              Cancelar
            </button>
            <button className={styles.saveBtn} onClick={handleSave}>
              Guardar
            </button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
