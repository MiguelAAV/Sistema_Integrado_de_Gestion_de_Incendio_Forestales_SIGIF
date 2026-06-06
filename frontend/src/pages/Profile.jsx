import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    telefono: "",
    direccion: "",
    email: "",
    genero: ""
  });

  useEffect(() => {
    if (user) {
      setForm({
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        email: user.email || "",
        genero: user.genero || ""
      });
    }
  }, [user]);

  const position = user?.lat && user?.lng
    ? [Number(user.lat), Number(user.lng)]
    : [-35.0, -71.26];

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    const token = sessionStorage.getItem("sigif_token");
    const body = { ...form };
    if (photoPreview) body.fotoPerfil = photoPreview;

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }

      const data = await response.json();
      updateUser(data.user);
      setMessage("Perfil actualizado correctamente.");
      setEditing(false);
      setPhotoPreview("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setError("");
    setMessage("");
    setBusy(true);

    const token = sessionStorage.getItem("sigif_token");

    try {
      const response = await fetch(`${API_URL}/api/auth/account`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }

      logout();
      navigate("/login");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function toggleEdit() {
    if (editing) {
      setForm({
        telefono: user?.telefono || "",
        direccion: user?.direccion || "",
        email: user?.email || "",
        genero: user?.genero || ""
      });
      setPhotoPreview("");
    }
    setEditing(!editing);
    setError("");
    setMessage("");
    setDeleting(false);
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {photoPreview ? (
              <img src={photoPreview} alt="avatar" />
            ) : user?.fotoPerfil ? (
              <img src={user.fotoPerfil} alt="avatar" />
            ) : (
              <span className="avatar-placeholder">
                {user?.name?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div>
            <h1>{user?.name || "Usuario"}</h1>
            <p className="profile-role">{user?.role} &middot; {user?.area}</p>
            <button className="btn-edit-profile" onClick={toggleEdit}>
              {editing ? "Cancelar" : "Editar perfil"}
            </button>
          </div>
        </div>

        {message && <div className="message">{message}</div>}
        {error && <p className="form-error">{error}</p>}

        {editing ? (
          <form onSubmit={handleSave} className="profile-edit-form">
            <div className="profile-details">
              <div className="profile-field">
                <span className="field-label">RUT</span>
                <span className="field-value">{user?.rut || "—"}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Telefono</span>
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>
              <div className="profile-field">
                <span className="field-label">Direccion</span>
                <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              </div>
              <div className="profile-field">
                <span className="field-label">Correo electronico</span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="profile-field">
                <span className="field-label">Genero</span>
                <select value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })}>
                  <option value="">Seleccionar</option>
                  <option>Masculino</option>
                  <option>Femenino</option>
                  <option>Otro</option>
                </select>
              </div>
              <div className="profile-field">
                <span className="field-label">Fecha de nacimiento</span>
                <span className="field-value">{user?.fechaNacimiento || "—"}</span>
              </div>
            </div>

            <div className="photo-upload edit-photo">
              <p>Foto de perfil</p>
              <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>Cambiar foto</button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} hidden />
              {photoPreview && <img src={photoPreview} alt="preview" className="photo-preview" />}
            </div>

            <div className="profile-actions">
              <button type="submit" disabled={busy}>{busy ? "Guardando..." : "Guardar cambios"}</button>
              <button type="button" className="btn-secondary" onClick={toggleEdit}>Cancelar</button>
            </div>

            <div className="delete-section">
              {deleting ? (
                <div className="delete-confirm">
                  <p>¿Estas seguro? Esta accion eliminara tu cuenta permanentemente. No se puede deshacer.</p>
                  <div className="delete-actions">
                    <button type="button" className="btn-danger" onClick={handleDelete} disabled={busy}>
                      {busy ? "Eliminando..." : "Si, eliminar mi cuenta"}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setDeleting(false)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="btn-delete" onClick={() => setDeleting(true)}>
                  Eliminar cuenta
                </button>
              )}
            </div>
          </form>
        ) : (
          <>
            <div className="profile-details">
              <div className="profile-field">
                <span className="field-label">RUT</span>
                <span className="field-value">{user?.rut || "—"}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Telefono</span>
                <span className="field-value">{user?.telefono || "—"}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Direccion</span>
                <span className="field-value">{user?.direccion || "—"}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Correo electronico</span>
                <span className="field-value">{user?.email || "—"}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Genero</span>
                <span className="field-value">{user?.genero || "—"}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Fecha de nacimiento</span>
                <span className="field-value">{user?.fechaNacimiento || "—"}</span>
              </div>
            </div>

            <div className="profile-map-section">
              <p className="field-label">Ubicacion registrada</p>
              <div className="profile-map">
                <MapContainer center={position} zoom={14} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={position} />
                </MapContainer>
              </div>
              <p className="map-coords">Lat: {Number(position[0]).toFixed(4)} &middot; Lng: {Number(position[1]).toFixed(4)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
