import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function fetchJson(path) {
  return fetch(`${API_URL}${path}`).then((res) => res.json());
}

function Metric({ label, value }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>;
}

function Panel({ title, subtitle, children }) {
  return <article className="panel"><div className="panel-header"><h2>{title}</h2><p>{subtitle}</p></div>{children}</article>;
}

function CompactList({ items }) {
  return <ul className="compact-list">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
}

function SenapredPanel({ status, events }) {
  if (!status) return <p className="loading-text">Cargando SENAPRED...</p>;

  const levelClass = status.regionalAlert === "Alerta Roja" ? "tag-danger" : status.regionalAlert === "Alerta Amarilla" ? "tag-warn" : "tag-info";

  return (
    <div className="mock-api-panel">
      <div className="api-header">
        <span className="api-provider">{status.provider}</span>
        <span className={`tag ${levelClass}`}>{status.regionalAlert}</span>
      </div>

      <div className="api-body">
        <div className="api-row">
          <span className="api-label">Comuna</span>
          <span className="api-value">{status.commune}</span>
        </div>
        <div className="api-row">
          <span className="api-label">Riesgo climatico</span>
          <span className="api-value">{status.weatherRisk}</span>
        </div>
        <div className="api-row">
          <span className="api-label">Recomendacion</span>
          <span className="api-value">{status.recommendation}</span>
        </div>
      </div>

      {events && events.length > 0 && (
        <>
          <h4 className="api-subtitle">Eventos activos</h4>
          <ul className="api-events">
            {events.map((evt) => (
              <li key={evt.id} className="api-event">
                <span className="event-id">{evt.id}</span>
                <span className={`tag ${evt.level === "Alerta Roja" ? "tag-danger" : evt.level === "Alerta Amarilla" ? "tag-warn" : "tag-info"}`}>
                  {evt.level}
                </span>
                <span className="event-commune">{evt.commune}</span>
                <span className="event-status">{evt.status}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function BomberosPanel({ resources, incidents }) {
  if (!resources) return <p className="loading-text">Cargando Bomberos...</p>;

  return (
    <div className="mock-api-panel">
      <div className="api-header">
        <span className="api-provider">{resources.provider}</span>
        <span className="tag tag-info">Mock simulado</span>
      </div>

      <div className="api-stats">
        <div className="api-stat">
          <strong>{resources.availableUnits}</strong>
          <span>Unidades</span>
        </div>
        <div className="api-stat">
          <strong>{resources.waterTrucks}</strong>
          <span>Carros aljibe</span>
        </div>
        <div className="api-stat">
          <strong>{resources.volunteersOnDuty}</strong>
          <span>Voluntarios</span>
        </div>
        <div className="api-stat">
          <strong>{resources.radioChannel}</strong>
          <span>Canal</span>
        </div>
      </div>

      {incidents && incidents.length > 0 && (
        <>
          <h4 className="api-subtitle">Incidentes activos</h4>
          <ul className="api-events">
            {incidents.map((inc) => (
              <li key={inc.id} className="api-event">
                <span className="event-id">{inc.id}</span>
                <span className="event-commune">{inc.sector}</span>
                <span className={`tag ${inc.status === "En terreno" ? "tag-success" : inc.status === "Despachado" ? "tag-warn" : "tag-info"}`}>
                  {inc.status}
                </span>
                <span className="event-status">ETA: {inc.etaMinutes} min</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Table({ rows, columns }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column}>{row[column]}</td>)}</tr>)}</tbody></table></div>;
}

function MapPoint({ item, type }) {
  const left = type === "fire" ? 20 + Math.abs(item.lng + 71.36) * 250 : 45 + Math.abs(item.lng + 71.31) * 220;
  const top = type === "fire" ? 20 + Math.abs(item.lat + 34.94) * 520 : 30 + Math.abs(item.lat + 34.96) * 470;
  return <span className={`map-point ${type}`} style={{ left: `${Math.min(left, 88)}%`, top: `${Math.min(top, 82)}%` }} title={item.sector || item.name} />;
}

export default function FuncionarioDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    summary: null, users: [], reports: [], brigades: [], alerts: [], riskZones: [], 
    senapred: null, senapredEvents: [], bomberos: null, bomberosIncidents: []
  });
  const [evacPoints, setEvacPoints] = useState([]);
  const [form, setForm] = useState({ sector: "", type: "Humo visible", severity: "Media", reporterName: "", lat: "-35.000", lng: "-71.260", descripcion: "", region: "Region del Maule", comuna: "Valle del Sol", direccion: "", checklist: [], fotos: [] });
  const [message, setMessage] = useState("");
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

  async function loadData() {
    const [summary, usersData, reports, brigades, alertsData, riskZones, senapred, senapredEvents, bomberos, bomberosIncidents, evac] = await Promise.all([
      fetchJson("/api/summary"),
      fetchJson("/api/users"),
      fetchJson("/api/reports"),
      fetchJson("/api/brigades"),
      fetchJson("/api/alerts"),
      fetchJson("/api/risk-zones"),
      fetchJson("/api/mock/senapred/status"),
      fetchJson("/api/mock/senapred/events"),
      fetchJson("/api/mock/bomberos/resources"),
      fetchJson("/api/mock/bomberos/incidents"),
      fetchJson("/api/evacuation-points")
    ]);

    setData({ summary, users: usersData, reports, brigades, alerts: alertsData, riskZones, senapred, senapredEvents, bomberos, bomberosIncidents });
    setEvacPoints(evac);
  }

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadData().catch(() => setMessage("No se pudo conectar al backend local."));
  }, [user]);

  async function createReport(event) {
    event.preventDefault();
    setMessage("");
    const response = await fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!response.ok) { setMessage("Faltan datos obligatorios"); return; }
    setForm({ sector: "", type: "Humo visible", severity: "Media", reporterName: "", lat: "-35.000", lng: "-71.260", descripcion: "", region: "Region del Maule", comuna: "Valle del Sol", direccion: "", checklist: [], fotos: [] });
    setPhotoPreviews([]);
    setMessage("Reporte registrado.");
    await loadData();
  }

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Municipalidad Valle del Sol</p>
          <h1>SIGIF &mdash; Gestion municipal</h1>
          <p>Panel de coordinacion operativa para gestionar reportes, brigadas, alertas, puntos de evacuacion e integraciones mock.</p>
        </div>
        <div className="hero-card">
          <span>Objetivo de deteccion</span>
          <strong>&lt; 5 min</strong>
          <small>Situacion actual: 35 min promedio.</small>
          {user && <small className="user-info">{user.name} ({user.role})</small>}
        </div>
      </section>

      {message && <div className="message">{message}</div>}

      <section className="metrics">
        <Metric label="Focos activos" value={data.summary?.activeReports ?? "-"} />
        <Metric label="Focos criticos" value={data.summary?.criticalReports ?? "-"} />
        <Metric label="Brigadas en terreno" value={data.summary?.brigadesInField ?? "-"} />
        <Metric label="Alertas emitidas" value={data.summary?.alertsSent ?? "-"} />
      </section>

      <section className="grid two-columns">
        <Panel title="Registrar reporte" subtitle="Ingreso manual de focos">
          <form onSubmit={createReport} className="report-form">
            <label>Sector<input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Ej: Los Aromos" /></label>
            <label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Humo visible</option><option>Foco forestal</option><option>Quema no autorizada</option><option>Quema agricola</option><option>Riesgo preventivo</option><option>Columna de humo</option><option>Foco cercano a viviendas</option></select></label>
            <label>Severidad<select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option>Baja</option><option>Media</option><option>Alta</option><option>Critica</option></select></label>
            <label>Descripcion<textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} placeholder="Describe lo que observas..." /></label>
            <div className="form-row">
              <label>Region<select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}><option>Region del Maule</option><option>Region del Bio-Bio</option><option>Region de OHiggins</option><option>Region Metropolitana</option></select></label>
              <label>Comuna<select value={form.comuna} onChange={(e) => setForm({ ...form, comuna: e.target.value })}><option>Valle del Sol</option><option>Talca</option><option>Curico</option><option>Linares</option><option>Constitucion</option></select></label>
            </div>
            <label>Direccion de referencia<input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, numero, punto de referencia" /></label>
            <div className="form-row"><label>Lat<input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></label><label>Lng<input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></label></div>

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

            <button type="submit">Registrar</button>
          </form>
        </Panel>

        <Panel title="Mapa GIS" subtitle="Focos, brigadas y zonas de riesgo">
          <div className="map-box">
            {data.reports.slice(0, 7).map((report) => <MapPoint key={report.id} item={report} type="fire" />)}
            {data.brigades.map((brigade) => <MapPoint key={brigade.id} item={brigade} type="brigade" />)}
          </div>
          <div className="legend"><span className="dot fire" /> Foco <span className="dot brigade" /> Brigada</div>
        </Panel>
      </section>

      <section className="grid two-columns">
        <Panel title="Puntos de evacuacion" subtitle="Gestion de centros habilitados">
          <CompactList items={evacPoints.map((p) => `${p.name} — Capacidad: ${p.capacity} | ${p.status}`)} />
        </Panel>

        <Panel title="Alertas y brigadas" subtitle="Coordinacion operativa">
          <h3>Alertas</h3>
          <CompactList items={data.alerts.map((a) => `${a.severity} — ${a.title} (${a.sector})`)} />
          <h3>Brigadas</h3>
          <CompactList items={data.brigades.map((b) => `${b.name}: ${b.status} — ${b.currentTask}`)} />
        </Panel>
      </section>

      <section className="grid three-columns">
        <Panel title="Usuarios del sistema" subtitle="Roles y acceso">
          <CompactList items={data.users.map((u) => `${u.role}: ${u.name}`)} />
        </Panel>
        <Panel title="SENAPRED" subtitle="Estado regional simulado">
          <SenapredPanel status={data.senapred} events={data.senapredEvents?.events} />
        </Panel>
        <Panel title="Bomberos" subtitle="Recursos simulados">
          <BomberosPanel resources={data.bomberos} incidents={data.bomberosIncidents?.incidents} />
        </Panel>
      </section>

      <section className="grid two-columns">
        <Panel title="Reportes recientes" subtitle="Todos los reportes del sistema">
          <Table rows={data.reports} columns={["sector", "type", "severity", "status", "assignedBrigade"]} />
        </Panel>
        <Panel title="Zonas de riesgo" subtitle="Analisis y planificacion">
          <CompactList items={data.riskZones.map((z) => `${z.risk} — ${z.name}: ${z.reason}`)} />
        </Panel>
      </section>
    </main>
  );
}
