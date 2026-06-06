import { useEffect, useState } from "react";
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

function ApiCard({ data }) {
  if (!data) return <p>Cargando...</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
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
    summary: null, users: [], reports: [], brigades: [], alerts: [], riskZones: [], senapred: null, bomberos: null
  });
  const [evacPoints, setEvacPoints] = useState([]);
  const [form, setForm] = useState({ sector: "", type: "Humo visible", severity: "Media", reporterName: "", lat: "-35.000", lng: "-71.260" });
  const [message, setMessage] = useState("");

  async function loadData() {
    const [summary, usersData, reports, brigades, alertsData, riskZones, senapred, bomberos, evac] = await Promise.all([
      fetchJson("/api/summary"),
      fetchJson("/api/users"),
      fetchJson("/api/reports"),
      fetchJson("/api/brigades"),
      fetchJson("/api/alerts"),
      fetchJson("/api/risk-zones"),
      fetchJson("/api/mock/senapred/status"),
      fetchJson("/api/mock/bomberos/resources"),
      fetchJson("/api/evacuation-points")
    ]);

    setData({ summary, users: usersData, reports, brigades, alerts: alertsData, riskZones, senapred, bomberos });
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
    setForm({ sector: "", type: "Humo visible", severity: "Media", reporterName: "", lat: "-35.000", lng: "-71.260" });
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
            <label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Humo visible</option><option>Foco forestal</option><option>Quema no autorizada</option><option>Riesgo preventivo</option></select></label>
            <label>Severidad<select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option>Baja</option><option>Media</option><option>Alta</option><option>Critica</option></select></label>
            <div className="form-row"><label>Lat<input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></label><label>Lng<input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></label></div>
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
        <Panel title="SENAPRED mock" subtitle="Estado regional simulado">
          <ApiCard data={data.senapred} />
        </Panel>
        <Panel title="Bomberos mock" subtitle="Recursos simulados">
          <ApiCard data={data.bomberos} />
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
