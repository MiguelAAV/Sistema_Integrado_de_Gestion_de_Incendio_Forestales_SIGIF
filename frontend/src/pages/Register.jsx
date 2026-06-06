import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("terms");
  const [accepted, setAccepted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    rut: "",
    telefono: "",
    contrasena: "",
    email: "",
    genero: "",
    direccion: "",
    fechaNacimiento: ""
  });

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await register({
        ...form,
        acceptedTerms: true,
        fotoPerfil: photoPreview
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (step === "terms") {
    return (
      <div className="register-page">
        <div className="register-card">
          <h1>Terminos y condiciones</h1>
          <p className="register-subtitle">Registro de Vecino &middot; SIGIF</p>

          <div className="terms-box">
            <p><strong>1. Finalidad del tratamiento de datos</strong></p>
            <p>Al registrarse como Vecino, autoriza a la Municipalidad del Valle del Sol a recopilar y tratar sus datos personales (nombre, RUT, telefono, direccion, ubicacion geografica y fotografia) con la finalidad exclusiva de:</p>
            <ul>
              <li>Verificar su identidad como vecino de la comuna.</li>
              <li>Geo-referenciar sus reportes de focos de incendio para una respuesta mas rapida y precisa.</li>
              <li>Enviar alertas de emergencia personalizadas segun su ubicacion.</li>
              <li><strong>Prevenir y detectar denuncias falsas</strong> que puedan desviar recursos de emergencia y poner en riesgo a la comunidad.</li>
            </ul>
            <p><strong>2. Responsabilidad</strong></p>
            <p>El vecino se compromete a realizar reportes veraces y fundados. El uso malicioso o falso del sistema sera puesto en conocimiento de las autoridades competentes.</p>
            <p><strong>3. Seguridad</strong></p>
            <p>Sus datos seran almacenados de forma segura y solo seran compartidos con cuerpos de emergencia (Bomberos, SENAPRED, Brigadas municipales) en caso de una alerta activa.</p>
            <p><strong>4. No aceptacion</strong></p>
            <p>En caso de no aceptar estos terminos, no podra registrarse ni hacer uso de la plataforma SIGIF.</p>
          </div>

          <label className="terms-check">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            He leido y acepto los terminos y condiciones
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="register-actions">
            <button className="btn-secondary" onClick={() => navigate("/login")}>Volver</button>
            <button disabled={!accepted || busy} onClick={() => { setError(""); setStep("form"); }}>Aceptar y continuar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card wide">
        <h1>Registro de Vecino</h1>
        <p className="register-subtitle">Completa tus datos para crear tu cuenta SIGIF</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-grid">
            <label>Nombre *<input value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required /></label>
            <label>Apellido paterno *<input value={form.apellidoPaterno} onChange={(e) => update("apellidoPaterno", e.target.value)} required /></label>
            <label>Apellido materno *<input value={form.apellidoMaterno} onChange={(e) => update("apellidoMaterno", e.target.value)} required /></label>
            <label>RUT (sin puntos con guion) *<input value={form.rut} onChange={(e) => update("rut", e.target.value)} placeholder="12345678-9" required /></label>
            <label>Telefono *<input type="tel" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} required /></label>
            <label>Direccion<input value={form.direccion} onChange={(e) => update("direccion", e.target.value)} /></label>
            <label>Fecha de nacimiento<input type="date" value={form.fechaNacimiento} onChange={(e) => update("fechaNacimiento", e.target.value)} /></label>
            <label>Correo electronico<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="opcional" /></label>
            <label>Genero<select value={form.genero} onChange={(e) => update("genero", e.target.value)}><option value="">Seleccionar</option><option>Masculino</option><option>Femenino</option><option>Otro</option></select></label>
            <label>Contrasena *<input type="password" value={form.contrasena} onChange={(e) => update("contrasena", e.target.value)} required /></label>
          </div>

          <div className="form-row-photo">
            <div className="photo-upload">
              <p>Foto de perfil (opcional)</p>
              <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>Seleccionar foto</button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} hidden />
              {photoPreview && <img src={photoPreview} alt="preview" className="photo-preview" />}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="register-actions">
            <button type="button" className="btn-secondary" onClick={() => setStep("terms")}>Volver a terminos</button>
            <button type="submit" disabled={busy}>{busy ? "Registrando..." : "Crear cuenta"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
