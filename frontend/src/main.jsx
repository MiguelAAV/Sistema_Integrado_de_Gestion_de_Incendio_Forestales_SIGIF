import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [data, setData] = useState({
    summary: null,
    users: [],
    reports: [],
    brigades: [],
    alerts: [],
    riskZones: [],
    senapred: null,
    bomberos: null
  });
  const [form, setForm] = useState({ sector: "", type: "Humo visible", severity: "Media", reporterName: "", lat: "-35.000", lng: "-71.260" });
  const [message, setMessage] = useState("");

  async function loadData() {
    const [summary, users, reports, brigades, alerts, riskZones, senapred, bomberos] = await Promise.all([
      fetchJson("/api/summary"),
      fetchJson("/api/users"),
      fetchJson("/api/reports"),
      fetchJson("/api/brigades"),
      fetchJson("/api/alerts"),
      fetchJson("/api/risk-zones"),
      fetchJson("/api/mock/senapred/status"),
      fetchJson("/api/mock/bomberos/resources")
    ]);
    setData({ summary, users, reports, brigades, alerts, riskZones, senapred, bomberos });
  }

  useEffect(() => {
    loadData().catch(() => setMessage("No se pudo conectar al backend local. Revisa que esté activo en el puerto 4000."));
  }, []);

  async function createReport(event) {
    event.preventDefault();
    setMessage("");
    const response = await fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!response.ok) { setMessage("Faltan datos obligatorios para crear el reporte."); return; }
    setForm({ sector: "", type: "Humo visible", severity: "Media", reporterName: "", lat: "-35.000", lng: "-71.260" });
    setMessage("✔ Reporte ciudadano registrado correctamente.");
    await loadData();
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-dot" />
        Sistema activo — MVP Web Local &nbsp;|&nbsp; Municipalidad Valle del Sol &nbsp;|&nbsp; SIGIF v1.0
      </div>

      <main>
        {/* ── HERO ── */}
        <section className="hero">
          <div>
            <p className="eyebrow">GPY1101 · Evaluación de Proyectos de Software</p>
            <h1>
              <span className="green">SIG</span><span className="fire">IF</span>
            </h1>
            <p>Sistema Integrado de Gestión de Incendios Forestales — detecta focos, coordina brigadas, emite alertas y consulta integraciones mock de Bomberos y SENAPRED en tiempo real.</p>
          </div>
          <div className="hero-kpi">
            <span className="kpi-label">Objetivo detección</span>
            <span className="kpi-value">&lt;5</span>
            <span className="kpi-sub">minutos · actual: 35 min promedio</span>
          </div>
        </section>

        {message && <div className="message">{message}</div>}

        {/* ── MÉTRICAS ── */}
        <div className="metrics">
          <Metric label="Focos activos"       value={data.summary?.activeReports ?? "—"}   color="red"    />
          <Metric label="Focos críticos"      value={data.summary?.criticalReports ?? "—"} color="yellow" />
          <Metric label="Brigadas en terreno" value={data.summary?.brigadesInField ?? "—"} color="green"  />
          <Metric label="Alertas emitidas"    value={data.summary?.alertsSent ?? "—"}       color="navy"   />
        </div>

        {/* ── REPORTE + MAPA ── */}
        <div className="section-wrap">
          <div className="section-title">Reporte y monitoreo</div>
          <div className="grid two-columns">
            <Panel title="🔥 Reporte ciudadano" subtitle="RF-01 — canal formal con geolocalización mock">
              <form onSubmit={createReport} className="report-form">
                <label>Sector
                  <input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Ej: Los Aromos" />
                </label>
                <label>Tipo de incidente
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option>Humo visible</option>
                    <option>Foco forestal</option>
                    <option>Quema no autorizada</option>
                    <option>Riesgo preventivo</option>
                  </select>
                </label>
                <label>Severidad
                  <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                    <option>Baja</option>
                    <option>Media</option>
                    <option>Alta</option>
                    <option>Critica</option>
                  </select>
                </label>
                <label>Nombre reportante (opcional)
                  <input value={form.reporterName} onChange={(e) => setForm({ ...form, reporterName: e.target.value })} placeholder="Nombre o anónimo" />
                </label>
                <div className="form-row">
                  <label>Latitud  <input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></label>
                  <label>Longitud <input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></label>
                </div>
                <button type="submit">Registrar reporte</button>
              </form>
            </Panel>

            <Panel title="🗺 Mapa GIS simplificado" subtitle="RF-02 — focos, brigadas y zonas de riesgo (mock)">
              <div className="map-box">
                {data.reports.slice(0, 7).map((r) => <MapPoint key={r.id} item={r} type="fire" />)}
                {data.brigades.map((b) => <MapPoint key={b.id} item={b} type="brigade" />)}
              </div>
              <div className="legend">
                <span className="dot fire" /> Foco de incendio
                <span className="dot brigade" /> Brigada / Bomberos
              </div>
            </Panel>
          </div>
        </div>

        {/* ── INTEGRACIONES ── */}
        <div className="section-wrap">
          <div className="section-title">Integraciones externas (mock)</div>
          <div className="grid three-columns">
            <Panel title="👥 Usuarios del MVP" subtitle="Actores del sistema web">
              <CompactList items={data.users.map((u) => `${u.role}: ${u.name}`)} />
            </Panel>
            <Panel title="🏛 API SENAPRED" subtitle="RF-04 — estado regional simulado">
              <ApiCard data={data.senapred} />
            </Panel>
            <Panel title="🚒 API Bomberos" subtitle="RF-04 — recursos operativos simulados">
              <ApiCard data={data.bomberos} />
            </Panel>
          </div>
        </div>

        {/* ── REPORTES + ALERTAS ── */}
        <div className="section-wrap">
          <div className="section-title">Gestión operacional</div>
          <div className="grid two-columns">
            <Panel title="📋 Reportes recientes" subtitle="10 datos mock + reportes creados en sesión">
              <Table rows={data.reports} columns={["sector", "type", "severity", "status", "assignedBrigade"]} />
            </Panel>
            <Panel title="⚠ Alertas y brigadas" subtitle="RF-03 y RF-05 — coordinación operativa">
              <p style={{ margin: "0 0 8px", fontWeight: 700, color: "var(--green-dark)", fontSize: ".85rem" }}>Alertas activas</p>
              <CompactList items={data.alerts.map((a) => `${a.severity} — ${a.title} (${a.sector})`)} />
              <p style={{ margin: "14px 0 8px", fontWeight: 700, color: "var(--green-dark)", fontSize: ".85rem" }}>Brigadas</p>
              <CompactList items={data.brigades.map((b) => `${b.name}: ${b.status} — ${b.currentTask}`)} />
            </Panel>
          </div>
        </div>

        {/* ── ZONAS DE RIESGO + ALCANCE MVP ── */}
        <div className="section-wrap">
          <div className="section-title">Análisis y alcance</div>
          <div className="grid two-columns">
            <Panel title="🌲 Zonas de riesgo" subtitle="Base para análisis histórico y planificación">
              <CompactList items={data.riskZones.map((z) => `${z.risk} — ${z.name}: ${z.reason}`)} />
            </Panel>
            <Panel title="📌 Límites del MVP" subtitle="Alcance inicial — demostración de viabilidad técnica">
              <CompactList items={[
                "Sin despliegue productivo",
                "Sin base de datos: datos mock en memoria",
                "Sin autenticación real: roles visibles para prototipo",
                "APIs externas simuladas en backend local",
                "Pensado para validar flujo web antes de app móvil"
              ]} />
            </Panel>
          </div>
        </div>
      </main>
    </>
  );
}

async function fetchJson(path) {
  const response = await fetch(`${API_URL}${path}`);
  return response.json();
}

function Metric({ label, value, color }) {
  return (
    <article className={`metric ${color}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="panel-body">{children}</div>
    </article>
  );
}

function CompactList({ items }) {
  return (
    <ul className="compact-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function ApiCard({ data }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>Cargando...</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

function Table({ rows, columns }) {
  const sevClass = (sev) => {
    if (!sev) return "";
    const s = sev.toLowerCase();
    if (s === "critica") return "sev-critica";
    if (s === "alta") return "sev-alta";
    return "";
  };
  const badge = (val, col) => {
    if (col !== "severity") return val;
    const cls = { critica: "badge-critica", alta: "badge-alta", media: "badge-media", baja: "badge-baja" }[val?.toLowerCase()] || "";
    return <span className={`badge ${cls}`}>{val}</span>;
  };
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={sevClass(row.severity)}>
              {columns.map((c) => <td key={c}>{badge(row[c], c)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MapPoint({ item, type }) {
  const left = type === "fire"
    ? 20 + Math.abs(item.lng + 71.36) * 250
    : 45 + Math.abs(item.lng + 71.31) * 220;
  const top = type === "fire"
    ? 20 + Math.abs(item.lat + 34.94) * 520
    : 30 + Math.abs(item.lat + 34.96) * 470;
  return (
    <span
      className={`map-point ${type}`}
      style={{ left: `${Math.min(left, 88)}%`, top: `${Math.min(top, 82)}%` }}
      title={item.sector || item.name}
    />
  );
}

createRoot(document.getElementById("root")).render(<App />);
