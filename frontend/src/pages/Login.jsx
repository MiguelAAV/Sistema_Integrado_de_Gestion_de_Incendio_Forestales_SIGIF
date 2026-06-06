import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Funcionario");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login(email, password, tab);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-decor" />

      <div className="login-card">
        <div className="login-brand">
          <img src="/Logo_SIGIF.png" alt="SIGIF" className="login-logo-img" />
          <h1>SIGIF</h1>
          <p>Sistema Integrado de Gestion de Incendios Forestales</p>
        </div>

        <div className="login-tabs">
          <button className={tab === "Funcionario" ? "active" : ""} onClick={() => setTab("Funcionario")}>Funcionario</button>
          <button className={tab === "Vecino" ? "active" : ""} onClick={() => setTab("Vecino")}>Vecino</button>
        </div>

        {tab === "Funcionario" ? (
          <form onSubmit={handleSubmit} className="login-form">
            <label>
              <span>Correo electronico</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="j.rivas@municipalidad.cl" required />
            </label>
            <label>
              <span>Contrasena</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin123" required />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" disabled={busy} className="btn-login-submit">
              {busy ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        ) : (
          <div className="vecino-login">
            <form onSubmit={handleSubmit} className="login-form">
              <label>
                <span>RUT (sin puntos con guion)</span>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="12345678-9" required />
              </label>
              <label>
                <span>Contrasena</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contrasena" required />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" disabled={busy} className="btn-login-submit">
                {busy ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
            <div className="vecino-register-link">
              <p>No tienes cuenta?</p>
              <Link to="/register" className="btn-outline">Crear cuenta como Vecino</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
