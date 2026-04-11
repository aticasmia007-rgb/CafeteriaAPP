import { useEffect, useState } from "react";
import { useApp } from "../../store/appStore";
import styles from "./AuthSheet.module.css";

type Mode = "login" | "register";

export default function AuthSheet() {
  const { state, dispatch } = useApp();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);

  // Mount immediately on open; unmount after close animation finishes (350ms transition + buffer)
  useEffect(() => {
    if (state.authSheetOpen) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(t);
    }
  }, [state.authSheetOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (!state.authSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [state.authSheetOpen]);

  // Reset form when closed
  useEffect(() => {
    if (!state.authSheetOpen) {
      setEmail("");
      setPassword("");
      setName("");
      setMode("login");
    }
  }, [state.authSheetOpen]);

  // Esc to close
  useEffect(() => {
    if (!state.authSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "CLOSE_AUTH_SHEET" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.authSheetOpen, dispatch]);

  const submitEmail = () => {
    if (!email || !password) return;
    if (mode === "register" && !name) return;
    dispatch({
      type: "LOGIN",
      user: {
        email,
        name: mode === "register" ? name : email.split("@")[0],
        provider: "email",
      },
    });
  };

  const handleGoogle = () => {
    dispatch({
      type: "LOGIN",
      user: {
        email: "estudiante@iespio.es",
        name: "Estudiante Pío Baroja",
        provider: "google",
      },
    });
  };

  const intentLabel =
    state.pendingIntent === "checkout"
      ? "Inicia sesión para finalizar tu pedido"
      : state.pendingIntent === "profile"
        ? "Inicia sesión para ver tu perfil"
        : mode === "login"
          ? "Bienvenido de nuevo"
          : "Crea tu cuenta";

  if (!mounted) return null;

  return (
    <>
      <div
        className={`${styles.backdrop} ${state.authSheetOpen ? styles.backdropOpen : ""}`}
        onClick={() => dispatch({ type: "CLOSE_AUTH_SHEET" })}
        aria-hidden={!state.authSheetOpen}
      />
      <aside
        className={`${styles.sheet} ${state.authSheetOpen ? styles.sheetOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      >
        <div className={styles.handle} />

        <div className={styles.header}>
          <h2 className={styles.title}>{intentLabel}</h2>
          <button
            className={styles.closeBtn}
            onClick={() => dispatch({ type: "CLOSE_AUTH_SHEET" })}
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
            onClick={() => setMode("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={`${styles.tab} ${mode === "register" ? styles.tabActive : ""}`}
            onClick={() => setMode("register")}
          >
            Crear cuenta
          </button>
        </div>

        <button className={styles.googleBtn} onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.4 35.7 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Continuar con Google
        </button>

        <div className={styles.divider}>
          <span>o con email</span>
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            submitEmail();
          }}
        >
          {mode === "register" && (
            <label className={styles.field}>
              <span className={styles.label}>Nombre</span>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </label>
          )}
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={4}
            />
          </label>

          <button type="submit" className={styles.submitBtn}>
            {mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <p className={styles.footnote}>
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </aside>
    </>
  );
}
