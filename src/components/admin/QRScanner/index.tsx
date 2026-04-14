import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import BottomSheet from "../../shared/BottomSheet";
import styles from "./QRScanner.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the raw decoded QR string when a code is detected */
  onDetected: (value: string) => void;
}

type State = "requesting" | "scanning" | "success" | "error";

export default function QRScanner({ open, onClose, onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const [scanState, setScanState] = useState<State>("requesting");
  const [detectedCode, setDetectedCode] = useState("");

  // Start / stop camera when the sheet opens or closes
  useEffect(() => {
    if (!open) {
      stopCamera();
      setScanState("requesting");
      setDetectedCode("");
      return;
    }
    startCamera();
    return () => stopCamera();
  }, [open]);

  async function startCamera() {
    setScanState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 640 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanState("scanning");
        rafRef.current = requestAnimationFrame(tick);
      }
    } catch {
      setScanState("error");
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function tick() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (result?.data) {
      stopCamera();
      setDetectedCode(result.data);
      setScanState("success");
      // Brief success flash, then close and report
      setTimeout(() => {
        onDetected(result.data);
        onClose();
      }, 900);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <BottomSheet open={open} onClose={onClose} maxWidth="400px" label="Escanear QR">
      <div className={styles.body}>
        <p className={styles.title}>Escanear código QR</p>

        {scanState === "scanning" && (
          <p className={styles.hint}>Apunta la cámara al QR del pedido</p>
        )}

        {(scanState === "requesting" || scanState === "scanning") && (
          <div className={styles.viewport}>
            <video
              ref={videoRef}
              className={styles.video}
              playsInline
              muted
              aria-label="Vista de cámara"
            />
            <canvas ref={canvasRef} className={styles.canvas} />
            {scanState === "scanning" && (
              <div className={styles.frame}>
                <div className={styles.frameInner} />
                <div className={styles.laser} />
              </div>
            )}
          </div>
        )}

        {scanState === "error" && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>📵</span>
            <p>No se pudo acceder a la cámara. Comprueba los permisos del navegador.</p>
          </div>
        )}

        {scanState === "success" && (
          <div className={styles.success}>
            <span className={styles.successIcon}>✅</span>
            <p className={styles.successText}>Código detectado</p>
            <p className={styles.successCode}>{detectedCode}</p>
          </div>
        )}

        {scanState !== "success" && (
          <button className={styles.closeBtn} onClick={onClose}>
            Cancelar
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
