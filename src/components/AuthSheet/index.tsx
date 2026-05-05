import { useEffect, useState } from "react";
import { useApp } from "../../store/appStore";
import BottomSheet from "../shared/BottomSheet";
import styles from "./AuthSheet.module.css";
import LoginButton from "../LoginButton";


type Mode = "login" | "register";

export default function AuthSheet() {
  const { state, dispatch } = useApp();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const[googleClient, setGoogleClient] = useState<any>(null);

  const open = state.authSheetOpen;
  const close = () => dispatch({ type: "CLOSE_AUTH_SHEET" });


  // inicialize Google Identity Services (GSI)
  useEffect(() => {
    /* global google */
    // si SDK está cargado en el index.html y open
    if ((window as any).google && open && !googleClient) {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: "650533798034-2aqmekrh6jr1jbv81dq50j663kg3vv15.apps.googleusercontent.com", //  ID DE GOOGLE
        scope: "openid email profile",
        callback: async (response: any) => {
          if (response.access_token) {
            console.log("Google Access Token:", response);
            
            /** 
             * LLamada a backend:
             * const res = await fetch('/api/auth/google', { ... });
             * const userData = await res.json();
             */

            // Simulación de login exitoso tras recibir el token
            dispatch({
              type: "LOGIN",
              user: {
                email: "aticasmia007@gmail.es", 
                name: "Comprobado Google Auth",
                provider: "google",
              },
            });
            close();
          }
        },
      });
      setGoogleClient(client);
    }
  }, [open, googleClient, dispatch]);

  
  const handleGoogleLogin = () => {
    if (googleClient) {
      googleClient.requestAccessToken();
    } else {
      console.error("Google SDK no cargado");
      alert("El servicio de Google se está cargando, inténtalo de nuevo.");
    }
  };


  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setName("");
      setMode("login");
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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

  return (
    <BottomSheet
      open={open}
      onClose={close}
      maxWidth="440px"
      label={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{intentLabel}</h2>
        <button className={styles.closeBtn} onClick={close} aria-label="Cerrar">
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

      <LoginButton onClick={handleGoogleLogin} />

      <div className={styles.divider}>
        <span>o con email</span>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => { e.preventDefault(); submitEmail(); }}
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
    </BottomSheet>
  );
}
