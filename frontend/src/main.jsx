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
    loadData().catch(() => setMessage("No se pudo conectar al backend local. Revisa que este activo en el puerto 4000."));
  }, []);

  async function createReport(event) {
    event.preventDefault();
    setMessage("");

    const response = await fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      setMessage("Faltan datos obligatorios para crear el reporte.");
      return;
    }

    setForm({ sector: "", type: "Humo visible", severity: "Media", reporterName: "", lat: "-35.000", lng: "-71.260" });
    setMessage("Reporte ciudadano registrado en el mock local.");
    await loadData();
  }

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Municipalidad Valle del Sol</p>
          <h1>SIGIF MVP Web Local</h1>
          <p>Sistema Integrado de Gestion de Incendios Forestales para reportar focos, coordinar brigadas, emitir alertas y consultar integraciones mock de Bomberos y SENAPRED.</p>
        </div>
        <div className="hero-card">
          <span>Objetivo de deteccion</span>
          <strong>&lt; 5 min</strong>
          <small>Situacion actual documentada: 35 min promedio.</small>
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
        <Panel title="Reporte ciudadano" subtitle="RF-01: canal formal con geolocalizacion mock">
          <form onSubmit={createReport} className="report-form">
            <label>Sector<input value={form.sector} onChange={(event) => setForm({ ...form, sector: event.target.value })} placeholder="Ej: Los Aromos" /></label>
            <label>Tipo<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Humo visible</option><option>Foco forestal</option><option>Quema no autorizada</option><option>Riesgo preventivo</option></select></label>
            <label>Severidad<select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}><option>Baja</option><option>Media</option><option>Alta</option><option>Critica</option></select></label>
            <label>Nombre reportante<input value={form.reporterName} onChange={(event) => setForm({ ...form, reporterName: event.target.value })} placeholder="Opcional" /></label>
            <div className="form-row">
              <label>Lat<input value={form.lat} onChange={(event) => setForm({ ...form, lat: event.target.value })} /></label>
              <label>Lng<input value={form.lng} onChange={(event) => setForm({ ...form, lng: event.target.value })} /></label>
            </div>
            <button type="submit">Registrar reporte</button>
          </form>
        </Panel>

        <Panel title="Mapa GIS simplificado" subtitle="RF-02: puntos mock para focos, brigadas y zonas de riesgo">
          <div className="map-box">
            {data.reports.slice(0, 7).map((report) => <MapPoint key={report.id} item={report} type="fire" />)}
            {data.brigades.map((brigade) => <MapPoint key={brigade.id} item={brigade} type="brigade" />)}
          </div>
          <div className="legend"><span className="dot fire" /> Foco <span className="dot brigade" /> Brigada</div>
        </Panel>
      </section>

      <section className="grid three-columns">
        <Panel title="Usuarios del MVP" subtitle="Actores que ocuparan la app web">
          <CompactList items={data.users.map((user) => `${user.role}: ${user.name}`)} />
        </Panel>
        <Panel title="API SENAPRED mock" subtitle="RF-04: estado regional simulado">
          <ApiCard data={data.senapred} />
        </Panel>
        <Panel title="API Bomberos mock" subtitle="RF-04: recursos operativos simulados">
          <ApiCard data={data.bomberos} />
        </Panel>
      </section>

      <section className="grid two-columns">
        <Panel title="Reportes recientes" subtitle="10 datos mock iniciales + reportes creados en memoria">
          <Table rows={data.reports} columns={["sector", "type", "severity", "status", "assignedBrigade"]} />
        </Panel>
        <Panel title="Alertas y brigadas" subtitle="RF-03 y RF-05 para coordinacion operativa">
          <h3>Alertas</h3>
          <CompactList items={data.alerts.map((alert) => `${alert.severity} - ${alert.title} (${alert.sector})`)} />
          <h3>Brigadas</h3>
          <CompactList items={data.brigades.map((brigade) => `${brigade.name}: ${brigade.status} - ${brigade.currentTask}`)} />
        </Panel>
      </section>

      <section className="grid two-columns">
        <Panel title="Zonas de riesgo" subtitle="Base para analisis historico y planificacion">
          <CompactList items={data.riskZones.map((zone) => `${zone.risk} - ${zone.name}: ${zone.reason}`)} />
        </Panel>
        <Panel title="Reglas del MVP local" subtitle="Alcance inicial">
          <CompactList items={["Sin despliegue productivo", "Sin base de datos: datos mock en memoria", "Sin autenticacion real: roles visibles para prototipo", "APIs externas simuladas en backend", "Pensado para validar flujo web antes de app movil"]} />
        </Panel>
      </section>
    </main>
  );
}

async function fetchJson(path) {
  const response = await fetch(`${API_URL}${path}`);
  return response.json();
}

function Metric({ label, value }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>;
}

function Panel({ title, subtitle, children }) {
  return <article className="panel"><div className="panel-header"><h2>{title}</h2><p>{subtitle}</p></div>{children}</article>;
}

function CompactList({ items }) {
  return <ul className="compact-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
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

createRoot(document.getElementById("root")).render(<App />);
