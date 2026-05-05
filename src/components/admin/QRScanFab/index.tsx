import { useState } from "react";
import QRScanner from "../QRScanner";
import ScannedOrderSheet from "../ScannedOrderSheet";
import styles from "./QRScanFab.module.css";

export default function QRScanFab() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedValue, setScannedValue] = useState("");
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);

  function handleDetected(value: string) {
    setScannedValue(value);
    setOrderSheetOpen(true);
  }

  return (
    <>
      <button
        className={styles.scanFab}
        onClick={() => setScannerOpen(true)}
        aria-label="Escanear QR"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="5" height="5" rx="1" />
          <rect x="16" y="3" width="5" height="5" rx="1" />
          <rect x="3" y="16" width="5" height="5" rx="1" />
          <path d="M21 16h-3a2 2 0 00-2 2v3" />
          <line x1="21" y1="21" x2="21" y2="21" />
        </svg>
      </button>

      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleDetected}
      />

      <ScannedOrderSheet
        open={orderSheetOpen}
        onClose={() => setOrderSheetOpen(false)}
        scannedValue={scannedValue}
      />
    </>
  );
}
