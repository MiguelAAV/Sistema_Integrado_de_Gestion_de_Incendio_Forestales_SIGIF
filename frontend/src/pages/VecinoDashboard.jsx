import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, TileLayer } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
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

export default function VecinoDashboard({ hybridRole }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [evacuationPoints, setEvacuationPoints] = useState([]);
  const [message, setMessage] = useState("");
  const [emergencyMsg, setEmergencyMsg] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState({ sector: "", type: "Humo visible", severity: "Media", reporterName: user?.name || "", lat: "-35.000", lng: "-71.260", descripcion: "", region: "Region del Maule", comuna: "Valle del Sol", direccion: "", checklist: [], fotos: [] });
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const photoInputRef = useRef(null);

  const checklistItems = [
    { value: "viento", label: "Hay viento fuerte en el sector" },
    { value: "viviendas", label: "El fuego se acerca a viviendas" },
    { value: "atrapados", label: "Hay personas atrapadas" },
    { value: "material", label: "Hay material inflamable cercano" },
    { value: "acceso", label: "El acceso al sector es dificil" },
    { value: "humo", label: "El humo afecta la visibilidad en ruta" }
  ];

  function toggleChecklist(value) {
    setForm((prev) => ({
      ...prev,
      checklist: prev.checklist.includes(value)
        ? prev.checklist.filter((v) => v !== value)
        : [...prev.checklist, value]
    }));
  }

  function handlePhotos(event) {
    const files = Array.from(event.target.files || []);
    const readers = files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then((results) => {
      setPhotoPreviews((prev) => [...prev, ...results]);
      setForm((prev) => ({ ...prev, fotos: [...prev.fotos, ...results] }));
    });
  }

  function removePhoto(index) {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  }

  const [alerts, setAlerts] = useState([]);
  const [brigades, setBrigades] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [senapred, setSenapred] = useState(null);
  const [senapredEvents, setSenapredEvents] = useState([]);
  const [bomberos, setBomberos] = useState(null);
  const [bomberosIncidents, setBomberosIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [trackingId, setTrackingId] = useState(null);
  const [notifInterval, setNotifInterval] = useState(null);

  function addNotification(title, detail) {
    const id = Date.now();
    setNotifications((prev) => [{ id, title, detail, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 12000);
  }

  function loadAll() {
    fetchJson("/api/reports").then((data) => {
      setReports((prev) => {
        if (prev.length > 0 && data.length > prev.length) {
          const nuevos = data.slice(0, data.length - prev.length);
          nuevos.forEach((r) => addNotification("Nuevo reporte", `${r.type} en ${r.sector} (${r.severity})`));
        }
        return data;
      });
    }).catch(() => {});
    fetchJson("/api/evacuation-points").then(setEvacuationPoints).catch(() => {});
    if (hybridRole === "bombero" || hybridRole === "funcionario") {
      fetchJson("/api/alerts").then(setAlerts).catch(() => {});
      fetchJson("/api/brigades").then(setBrigades).catch(() => {});
      fetchJson("/api/risk-zones").then(setRiskZones).catch(() => {});
      fetchJson("/api/mock/bomberos/resources").then(setBomberos).catch(() => {});
      fetchJson("/api/mock/bomberos/incidents").then((d) => setBomberosIncidents(d.incidents || [])).catch(() => {});
    }
    if (hybridRole === "funcionario") {
      fetchJson("/api/users").then(setUsers).catch(() => {});
      fetchJson("/api/mock/senapred/status").then(setSenapred).catch(() => {});
      fetchJson("/api/mock/senapred/events").then((d) => setSenapredEvents(d.events || [])).catch(() => {});
    }
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 15000);
    setNotifInterval(interval);
    return () => clearInterval(interval);
  }, [hybridRole]);

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

    setForm({ sector: "", type: "Humo visible", severity: "Media", reporterName: user?.name || "", lat: "-35.000", lng: "-71.260", descripcion: "", region: "Region del Maule", comuna: "Valle del Sol", direccion: "", checklist: [], fotos: [] });
    setPhotoPreviews([]);
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
          <h1>SIGIF {hybridRole === "bombero" ? "Bombero Voluntario" : hybridRole === "funcionario" ? "Funcionario Vecino" : "Vecino"}</h1>
          <p>Reporta focos de incendio, visualiza puntos de evacuacion y recibe alertas en tu zona.</p>
        </div>
        <div className="hero-card">
          <span>Bienvenido</span>
          <strong>{user?.name?.split(" ")[0] || "Vecino"}</strong>
          <small>{hybridRole === "bombero" ? "Acceso a recursos de Bomberos y brigadas" : hybridRole === "funcionario" ? "Panel de supervision municipal" : "Tu ubicacion registrada ayuda a una respuesta mas rapida."}</small>
        </div>
      </section>

      {emergencyMsg && <div className="message emergency-msg">{emergencyMsg}</div>}
      {message && <div className="message">{message}</div>}

      {notifications.length > 0 && (
        <section className="notif-bar">
          {notifications.slice(0, 4).map((n) => (
            <div key={n.id} className="notif-item">
              <strong>{n.title}</strong> {n.detail}
              <small>{n.time}</small>
            </div>
          ))}
        </section>
      )}

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
              <label>Sector <em>(ej: Los Aromos)</em><input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Nombre del sector" required /></label>

              <label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Humo visible</option><option>Foco forestal</option><option>Quema no autorizada</option><option>Quema agricola</option><option>Riesgo preventivo</option><option>Columna de humo</option><option>Foco cercano a viviendas</option><option>Incendio estructural</option>
              </select></label>

              <label>Severidad<select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option>Baja</option><option>Media</option><option>Alta</option><option>Critica</option>
              </select></label>

              <label>Descripcion<textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} placeholder="Describe lo que observas..." /></label>

              <div className="form-row">
                <label>Region<select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                  <option>Region del Maule</option><option>Region del Bio-Bio</option><option>Region de OHiggins</option><option>Region Metropolitana</option>
                </select></label>
                <label>Comuna<select value={form.comuna} onChange={(e) => setForm({ ...form, comuna: e.target.value })}>
                  <option>Valle del Sol</option><option>Talca</option><option>Curico</option><option>Linares</option><option>Constitucion</option>
                </select></label>
              </div>

              <label>Direccion de referencia<input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, numero, punto de referencia" /></label>

              <div className="form-row">
                <label>Latitud<input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></label>
                <label>Longitud<input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></label>
              </div>

              <div className="field-group">
                <p className="field-group-title">Checklist de condiciones</p>
                {checklistItems.map((item) => (
                  <label key={item.value} className="check-item">
                    <input type="checkbox" checked={form.checklist.includes(item.value)} onChange={() => toggleChecklist(item.value)} />
                    {item.label}
                  </label>
                ))}
              </div>

              <div className="photo-upload">
                <p>Fotos del sector (opcional)</p>
                <button type="button" className="btn-secondary" onClick={() => photoInputRef.current?.click()}>Agregar fotos</button>
                <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotos} hidden />
                {photoPreviews.length > 0 && (
                  <div className="photo-grid">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="photo-thumb">
                        <img src={src} alt="" />
                        <button type="button" className="photo-remove" onClick={() => removePhoto(i)}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit">Reportar incendio</button>
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

      <section className="grid two-columns">
        <div className="panel">
          <div className="panel-header">
            <h2>Tus reportes recientes</h2>
            <p>Da clic en un reporte para ver su seguimiento</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Sector</th><th>Tipo</th><th>Estado</th><th>Brigada</th></tr></thead>
              <tbody>
                {reports.filter((r) => r.source?.includes(user?.name || "") || r.source === "Ciudadano").slice(0, 8).map((r) => (
                  <tr key={r.id} className={trackingId === r.id ? "row-active" : ""} onClick={() => setTrackingId(trackingId === r.id ? null : r.id)} style={{ cursor: "pointer" }}>
                    <td>{r.sector}</td>
                    <td>{r.type}</td>
                    <td><span className={`tag ${r.status === "Activo" ? "tag-danger" : r.status === "Controlado" ? "tag-success" : r.status === "Pendiente" ? "tag-warn" : "tag-info"}`}>{r.status}</span></td>
                    <td>{r.assignedBrigade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>{trackingId ? "Seguimiento del reporte" : "Estado general"}</h2>
            <p>{trackingId ? `Reporte #${trackingId}` : "Resumen de actividad del sistema"}</p>
          </div>
          {trackingId ? (() => {
            const r = reports.find((rep) => rep.id === trackingId);
            if (!r) return <p className="loading-text">Reporte no encontrado</p>;
            const pasos = [
              { label: "Reportado", tiempo: r.reportedAt, icon: "✅", ok: true },
              { label: "En verificacion", tiempo: r.reportedAt ? new Date(new Date(r.reportedAt).getTime() + 120000).toISOString() : "", icon: r.status !== "Descartado" ? "✅" : "❌", ok: r.status !== "Descartado" },
              { label: "Brigada asignada", tiempo: r.assignedBrigade && r.assignedBrigade !== "Sin asignar" ? r.reportedAt : "", icon: r.assignedBrigade && r.assignedBrigade !== "Sin asignar" ? "✅" : "⏳", ok: r.assignedBrigade && r.assignedBrigade !== "Sin asignar" },
              { label: "En atencion", tiempo: r.status === "Activo" ? r.reportedAt : "", icon: r.status === "Activo" ? "🔄" : r.status === "Controlado" ? "✅" : r.status === "Descartado" ? "❌" : "⏳", ok: r.status === "Activo" || r.status === "Controlado" },
              { label: r.status === "Controlado" ? "Controlado" : r.status === "Descartado" ? "Descartado" : "Resuelto", tiempo: "", icon: r.status === "Controlado" ? "✅" : r.status === "Descartado" ? "❌" : "⏳", ok: r.status === "Controlado" }
            ];
            return (
              <div className="tracking-timeline">
                {pasos.map((paso, i) => (
                  <div key={i} className={`tracking-step ${paso.ok ? "done" : "pending"}`}>
                    <span className="tracking-icon">{paso.icon}</span>
                    <div><strong>{paso.label}</strong>{paso.tiempo && <small>{new Date(paso.tiempo).toLocaleString()}</small>}</div>
                  </div>
                ))}
                <div className="tracking-detail">
                  <p><strong>Tipo:</strong> {r.type}</p>
                  <p><strong>Severidad:</strong> {r.severity}</p>
                  <p><strong>Sector:</strong> {r.sector}</p>
                  <p><strong>Brigada:</strong> {r.assignedBrigade}</p>
                  {r.descripcion && <p><strong>Descripcion:</strong> {r.descripcion}</p>}
                  {r.checklist?.length > 0 && <p><strong>Checklist:</strong> {r.checklist.join(", ")}</p>}
                  {r.fotos?.length > 0 && <p><strong>Fotos:</strong> {r.fotos.length} adjunta(s)</p>}
                </div>
              </div>
            );
          })() : (
            <div>
              <div className="tracking-summary">
                <p>Ultima actualizacion: {new Date().toLocaleTimeString()}</p>
                <p>Reportes activos: {reports.filter((r) => r.status === "Activo").length}</p>
                <p>Reportes pendientes: {reports.filter((r) => r.status === "Pendiente").length}</p>
                <p>Reportes controlados: {reports.filter((r) => r.status === "Controlado").length}</p>
              </div>
              <p className="loading-text" style={{ marginTop: 12 }}>Selecciona un reporte de la tabla para ver su seguimiento en detalle.</p>
            </div>
          )}
        </div>
      </section>

      {(hybridRole === "bombero" || hybridRole === "funcionario") && (
        <section className="grid two-columns">
          <div className="panel">
            <div className="panel-header">
              <h2>Brigadas y Alertas</h2>
              <p>Estado operativo actual</p>
            </div>
            <h3>Alertas</h3>
            <ul className="compact-list">
              {alerts.map((a) => (
                <li key={a.id}>{a.severity} &mdash; {a.title} ({a.sector})</li>
              ))}
              {alerts.length === 0 && <li className="loading-text">Sin alertas activas</li>}
            </ul>
            <h3>Brigadas</h3>
            <ul className="compact-list">
              {brigades.map((b) => (
                <li key={b.id}>{b.name}: {b.status} &mdash; {b.currentTask}</li>
              ))}
              {brigades.length === 0 && <li className="loading-text">Sin brigadas</li>}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Recursos Bomberos</h2>
              <p>Disponibilidad simulada</p>
            </div>
            {bomberos ? (
              <div className="api-stats">
                <div className="api-stat"><strong>{bomberos.availableUnits}</strong><span>Unidades</span></div>
                <div className="api-stat"><strong>{bomberos.waterTrucks}</strong><span>Carros aljibe</span></div>
                <div className="api-stat"><strong>{bomberos.volunteersOnDuty}</strong><span>Voluntarios</span></div>
                <div className="api-stat"><strong>{bomberos.radioChannel}</strong><span>Canal</span></div>
              </div>
            ) : (
              <p className="loading-text">Cargando...</p>
            )}
            {bomberosIncidents.length > 0 && (
              <>
                <h4 className="api-subtitle">Incidentes activos</h4>
                <ul className="api-events">
                  {bomberosIncidents.map((inc) => (
                    <li key={inc.id} className="api-event">
                      <span className="event-id">{inc.id}</span>
                      <span className="event-commune">{inc.sector}</span>
                      <span className={`tag ${inc.status === "En terreno" ? "tag-success" : inc.status === "Despachado" ? "tag-warn" : "tag-info"}`}>{inc.status}</span>
                      <span className="event-status">ETA: {inc.etaMinutes} min</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      {hybridRole === "funcionario" && (
        <section className="grid two-columns">
          <div className="panel">
            <div className="panel-header">
              <h2>Usuarios del sistema</h2>
              <p>Roles y acceso</p>
            </div>
            <ul className="compact-list">
              {users.map((u) => (
                <li key={u.id}>{u.role}: {u.name}</li>
              ))}
              {users.length === 0 && <li className="loading-text">Cargando...</li>}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>SENAPRED</h2>
              <p>Estado regional simulado</p>
            </div>
            {senapred ? (
              <div className="mock-api-panel">
                <div className="api-header">
                  <span className="api-provider">{senapred.provider}</span>
                  <span className={`tag ${senapred.regionalAlert === "Alerta Roja" ? "tag-danger" : senapred.regionalAlert === "Alerta Amarilla" ? "tag-warn" : "tag-info"}`}>{senapred.regionalAlert}</span>
                </div>
                <div className="api-body">
                  <div className="api-row"><span className="api-label">Comuna</span><span className="api-value">{senapred.commune}</span></div>
                  <div className="api-row"><span className="api-label">Riesgo climatico</span><span className="api-value">{senapred.weatherRisk}</span></div>
                  <div className="api-row"><span className="api-label">Recomendacion</span><span className="api-value">{senapred.recommendation}</span></div>
                </div>
              </div>
            ) : (
              <p className="loading-text">Cargando...</p>
            )}
            {senapredEvents.length > 0 && (
              <>
                <h4 className="api-subtitle">Eventos activos</h4>
                <ul className="api-events">
                  {senapredEvents.map((evt) => (
                    <li key={evt.id} className="api-event">
                      <span className="event-id">{evt.id}</span>
                      <span className={`tag ${evt.level === "Alerta Roja" ? "tag-danger" : evt.level === "Alerta Amarilla" ? "tag-warn" : "tag-info"}`}>{evt.level}</span>
                      <span className="event-commune">{evt.commune}</span>
                      <span className="event-status">{evt.status}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Zonas de riesgo</h2>
              <p>Analisis y planificacion</p>
            </div>
            <ul className="compact-list">
              {riskZones.map((z) => (
                <li key={z.id}>{z.risk} &mdash; {z.name}: {z.reason}</li>
              ))}
              {riskZones.length === 0 && <li className="loading-text">Sin datos</li>}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Todos los reportes</h2>
              <p>Registro completo del sistema</p>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Sector</th><th>Tipo</th><th>Severidad</th><th>Estado</th><th>Brigada</th></tr></thead>
                <tbody>
                  {reports.slice(0, 10).map((r) => (
                    <tr key={r.id}><td>{r.sector}</td><td>{r.type}</td><td>{r.severity}</td><td>{r.status}</td><td>{r.assignedBrigade}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
