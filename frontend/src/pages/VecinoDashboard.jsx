import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, TileLayer } from "react-leaflet";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const fireIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const evacIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function fetchJson(path) {
  return fetch(`${API_URL}${path}`).then((r) => r.json());
}

export default function VecinoDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [evacuationPoints, setEvacuationPoints] = useState([]);
  const [message, setMessage] = useState("");
  const [emergencyMsg, setEmergencyMsg] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState({ sector: "", type: "Humo visible", severity: "Media", reporterName: user?.name || "", lat: "-35.000", lng: "-71.260" });

  useEffect(() => {
    fetchJson("/api/reports").then(setReports).catch(() => {});
    fetchJson("/api/evacuation-points").then(setEvacuationPoints).catch(() => {});
  }, []);

  async function handleEmergency() {
    setConfirming(false);
    setEmergencyMsg("");
    setMessage("");

    const body = {
      sector: "Mi zona - Emergencia",
      type: "Emergencia - incendio en mi zona",
      severity: "Critica",
      reporterName: user?.name || "Vecino",
      lat: user?.lat || -35.0,
      lng: user?.lng || -71.26
    };

    const response = await fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      setMessage("Error al generar la alerta de emergencia.");
      return;
    }

    setEmergencyMsg("Alerta de emergencia generada. Brigadas y Bomberos han sido notificados.");
    const updated = await fetchJson("/api/reports");
    setReports(updated);
    setTimeout(() => setEmergencyMsg(""), 8000);
  }

  async function createReport(event) {
    event.preventDefault();
    setMessage("");
    setEmergencyMsg("");

    const response = await fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      setMessage("Faltan datos obligatorios.");
      return;
    }

    setForm({ sector: "", type: "Humo visible", severity: "Media", reporterName: user?.name || "", lat: "-35.000", lng: "-71.260" });
    setMessage("Reporte registrado.");
    const updated = await fetchJson("/api/reports");
    setReports(updated);
  }

  const userLat = Number(user?.lat) || -35.0;
  const userLng = Number(user?.lng) || -71.26;
  const activeFires = reports.filter((r) => r.status === "Activo" || r.status === "Critica");

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Municipalidad Valle del Sol</p>
          <h1>SIGIF Vecino</h1>
          <p>Reporta focos de incendio, visualiza puntos de evacuacion y recibe alertas en tu zona.</p>
        </div>
        <div className="hero-card">
          <span>Bienvenido</span>
          <strong>{user?.name?.split(" ")[0] || "Vecino"}</strong>
          <small>Tu ubicacion registrada ayuda a una respuesta mas rapida.</small>
        </div>
      </section>

      {emergencyMsg && <div className="message emergency-msg">{emergencyMsg}</div>}
      {message && <div className="message">{message}</div>}

      <section className="emergency-section">
        {confirming ? (
          <div className="emergency-confirm">
            <p>¿Seguro? Se generara una alerta CRITICA de incendio en tu ubicacion.</p>
            <div className="emergency-actions">
              <button className="btn-emergency" onClick={handleEmergency}>Si, generar alerta</button>
              <button className="btn-secondary" onClick={() => setConfirming(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button className="btn-emergency pulse" onClick={() => setConfirming(true)}>
            BOTON DE EMERGENCIA
          </button>
        )}
      </section>

      <section className="grid two-columns">
        <div>
          <div className="panel">
            <div className="panel-header">
              <h2>Reportar incendio</h2>
              <p>Completa los datos del foco que deseas reportar</p>
            </div>
            <form onSubmit={createReport} className="report-form">
              <label>Sector<input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Ej: Los Aromos" required /></label>
              <label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Humo visible</option><option>Foco forestal</option><option>Quema no autorizada</option><option>Riesgo preventivo</option></select></label>
              <label>Severidad<select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option>Baja</option><option>Media</option><option>Alta</option><option>Critica</option></select></label>
              <div className="form-row">
                <label>Lat<input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></label>
                <label>Lng<input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></label>
              </div>
              <button type="submit">Reportar</button>
            </form>
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="panel-header">
              <h2>Puntos de evacuacion</h2>
              <p>Centros habilitados por la municipalidad</p>
            </div>
            <ul className="compact-list">
              {evacuationPoints.map((point) => (
                <li key={point.id}>
                  <strong>{point.name}</strong> &mdash; Capacidad: {point.capacity} personas<br />
                  <small>Estado: {point.status} &middot; {point.resources}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Mapa de incendios y evacuacion</h2>
            <p>Focos activos, zonas afectadas y puntos de evacuacion</p>
          </div>
          <div className="vecino-map">
            <MapContainer center={[userLat, userLng]} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {activeFires.map((fire) => (
                <Circle key={fire.id} center={[fire.lat, fire.lng]} radius={300} pathOptions={{ color: "#d83a24", fillColor: "#d83a24", fillOpacity: 0.2 }} />
              ))}
              {reports.map((fire) => (
                <Marker key={`fire-${fire.id}`} position={[fire.lat, fire.lng]} icon={fireIcon} />
              ))}
              {evacuationPoints.filter((p) => p.status === "Activo").map((point) => (
                <Marker key={`evac-${point.id}`} position={[point.lat, point.lng]} icon={evacIcon} />
              ))}
            </MapContainer>
          </div>
          <div className="legend">
            <span className="dot fire" /> Foco <span className="dot" style={{ background: "#22a55a" }} /> Evacuacion
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Tus reportes recientes</h2>
          <p>Historial de reportes realizados desde tu cuenta</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Sector</th><th>Tipo</th><th>Severidad</th><th>Estado</th><th>Brigada</th></tr></thead>
            <tbody>
              {reports.filter((r) => r.source?.includes(user?.name || "") || r.source === "Ciudadano").slice(0, 8).map((r) => (
                <tr key={r.id}><td>{r.sector}</td><td>{r.type}</td><td>{r.severity}</td><td>{r.status}</td><td>{r.assignedBrigade}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
