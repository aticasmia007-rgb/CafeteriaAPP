import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import styles from "./BottomSheet.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Max width of the card at ≥640px. Default: "480px" */
  maxWidth?: string;
  /** aria-label for the dialog element */
  label?: string;
}

/**
 * Shared modal shell used by AuthSheet, PendingOrderSheet, SlotModal, and
 * any other bottom-sheet / centered-dialog in the app.
 *
 * Mobile  → slides up from bottom edge
 * ≥640px  → floating centered-bottom card
 * ≥768px  → centered dialog with fade animation
 *
 * Manages its own mounted/animOpen state so consumers only pass `open`.
 */
export default function BottomSheet({ open, onClose, children, maxWidth = "480px", label }: Props) {
  const [mounted, setMounted] = useState(false);
  const [animOpen, setAnimOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Double rAF ensures the browser has painted the initial (closed) state
      // before applying the open class, so the CSS transition fires correctly.
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimOpen(true)));
    } else {
      setAnimOpen(false);
      const t = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`${styles.backdrop} ${animOpen ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.sheet} ${animOpen ? styles.sheetOpen : ""}`}
        style={{ "--bsheet-max-width": maxWidth } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className={styles.handle} aria-hidden="true" />
        {children}
      </div>
    </>
  );
}
