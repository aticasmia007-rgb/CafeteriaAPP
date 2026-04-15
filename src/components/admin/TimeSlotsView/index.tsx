import { useAdmin } from "../../../store/adminStore";
import SlotModal from "../SlotModal";
import styles from "./TimeSlotsView.module.css";

export default function TimeSlotsView() {
  const { state, dispatch } = useAdmin();

  const maxOrders = Math.max(...state.timeSlots.map((s) => s.maxOrders), 1);

  function getBarClass(slot: typeof state.timeSlots[0]) {
    if (slot.blocked) return styles.barBlocked;
    const ratio = slot.currentOrders / slot.maxOrders;
    if (ratio >= 0.9) return styles.barHigh;
    if (ratio >= 0.5) return styles.barMedium;
    return styles.barLow;
  }

  function getStatusLabel(slot: typeof state.timeSlots[0]) {
    if (slot.blocked) return "Bloqueado";
    const ratio = slot.currentOrders / slot.maxOrders;
    if (ratio >= 1) return "Completo";
    if (ratio >= 0.9) return "Casi lleno";
    if (ratio >= 0.5) return "Moderado";
    return "Disponible";
  }

  function getStatusClass(slot: typeof state.timeSlots[0]) {
    if (slot.blocked) return styles.statusBlocked;
    const ratio = slot.currentOrders / slot.maxOrders;
    if (ratio >= 0.9) return styles.statusHigh;
    if (ratio >= 0.5) return styles.statusMedium;
    return styles.statusLow;
  }

  function getProgressClass(slot: typeof state.timeSlots[0]) {
    if (slot.blocked) return styles.progressBlocked;
    const ratio = slot.currentOrders / slot.maxOrders;
    if (ratio >= 0.9) return styles.progressHigh;
    if (ratio >= 0.5) return styles.progressMedium;
    return styles.progressLow;
  }

  return (
    <div className={styles.content}>
      <h1 className={styles.title}>Control de Tramos</h1>

      <div className={styles.dashboardGrid}>

        {/* Left sticky panel: stepper + chart */}
        <div className={styles.stickyPanel}>

          {/* Global lead-time stepper */}
          <div className={styles.leadCard}>
            <div className={styles.leadLabel}>
              <span className={styles.leadTitle}>Tiempo de antelación</span>
              <span className={styles.leadDesc}>Mínimo para realizar un pedido</span>
            </div>
            <div className={styles.leadControls}>
              <button
                className={styles.leadBtn}
                onClick={() => dispatch({ type: "SET_LEAD_TIME", minutes: state.leadTimeMinutes - 15 })}
              >
                −
              </button>
              <div className={styles.leadValueWrap}>
                <div className={styles.leadValue}>{state.leadTimeMinutes}</div>
                <div className={styles.leadUnit}>min</div>
              </div>
              <button
                className={styles.leadBtn}
                onClick={() => dispatch({ type: "SET_LEAD_TIME", minutes: state.leadTimeMinutes + 15 })}
              >
                +
              </button>
            </div>
          </div>

          {/* Bar chart */}
          <div className={styles.chartSection}>
            <div className={styles.chartLabel}>Afluencia por tramo</div>
            <div className={styles.chartScroll}>
              <div className={styles.chart}>
                {state.timeSlots.map((slot) => {
                  const height = Math.max(
                    ((slot.blocked ? slot.maxOrders : slot.currentOrders) / maxOrders) * 180,
                    8
                  );
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      className={styles.barCol}
                      onClick={() => dispatch({ type: "SELECT_SLOT", slotId: slot.id })}
                      aria-label={`Ver tramo ${slot.startTime}`}
                    >
                      <span className={styles.barValue}>
                        {slot.blocked ? "🚫" : slot.currentOrders}
                      </span>
                      <div
                        className={`${styles.bar} ${getBarClass(slot)}`}
                        style={{ height }}
                      />
                      <span className={styles.barLabel}>
                        {slot.startTime}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotLow}`} />
                Baja
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotMedium}`} />
                Media
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotHigh}`} />
                Alta
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotBlocked}`} />
                Bloqueado
              </div>
            </div>
          </div>

        </div>{/* /stickyPanel */}

        {/* Right: slot cards (scrolls with the page) */}
        <div className={styles.slotsSection}>
          <div className={styles.slotsLabel}>Tramos horarios</div>
          <div className={styles.slotsGrid}>
            {state.timeSlots.map((slot) => {
              const ratio = slot.blocked ? 1 : slot.currentOrders / slot.maxOrders;
              return (
                <button
                  key={slot.id}
                  className={styles.slotCard}
                  onClick={() => dispatch({ type: "SELECT_SLOT", slotId: slot.id })}
                >
                  <div className={styles.slotCardTop}>
                    <span className={styles.slotName}>{slot.name}</span>
                    <span className={`${styles.slotStatus} ${getStatusClass(slot)}`}>
                      {getStatusLabel(slot)}
                    </span>
                  </div>
                  <span className={styles.slotTime}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {slot.startTime} – {slot.endTime}
                  </span>
                  <div className={styles.slotProgress}>
                    <div className={styles.progressTrack}>
                      <div
                        className={`${styles.progressFill} ${getProgressClass(slot)}`}
                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                      />
                    </div>
                    <span className={styles.slotCapacity}>
                      {slot.blocked ? "—" : slot.currentOrders} / {slot.maxOrders}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <SlotModal />
    </div>
  );
}
