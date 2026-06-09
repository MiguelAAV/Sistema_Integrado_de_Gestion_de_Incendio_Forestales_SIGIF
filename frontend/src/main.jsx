import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ── Data fetching ─────────────────────────────────────────────────────
async function fetchJson(path) {
  const res = await fetch(`${API_URL}${path}`);
  return res.json();
}

async function patchJson(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res;
}

async function postJson(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res;
}

// ── App ───────────────────────────────────────────────────────────────
function App() {
  const [data, setData] = useState({
    summary: null, users: [], reports: [], brigades: [],
    alerts: [], riskZones: [], senapred: null, bomberos: null, stats: null
  });
  const [reportForm, setReportForm] = useState({
    sector: "", type: "Humo visible", severity: "Media", reporterName: "", lat: "-35.000", lng: "-71.260"
  });
  const [alertForm, setAlertForm] = useState({
    title: "", sector: "", severity: "Alta", channel: "Web/SMS"
  });
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [activeTab, setActiveTab] = useState("dashboard");

  async function loadData() {
    const [summary, users, reports, brigades, alerts, riskZones, senapred, bomberos, stats] =
      await Promise.all([
        fetchJson("/api/summary"),
        fetchJson("/api/users"),
        fetchJson("/api/reports"),
        fetchJson("/api/brigades"),
        fetchJson("/api/alerts"),
        fetchJson("/api/risk-zones"),
        fetchJson("/api/mock/senapred/status"),
        fetchJson("/api/mock/bomberos/resources"),
        fetchJson("/api/stats"),
      ]);
    setData({ summary, users, reports, brigades, alerts, riskZones, senapred, bomberos, stats });
  }

  useEffect(() => {
    loadData().catch(() =>
      setMessage({ text: "No se pudo conectar al backend local. Revisa que esté activo en el puerto 4000.", type: "warn" })
    );
  }, []);

  function notify(text, type = "ok") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "info" }), 4000);
  }

  // RF-01 — Crear reporte ciudadano
  async function createReport(e) {
    e.preventDefault();
    const res = await postJson("/api/reports", reportForm);
    if (!res.ok) { notify("Faltan datos obligatorios para crear el reporte.", "warn"); return; }
    setReportForm({ sector: "", type: "Humo visible", severity: "Media", reporterName: "", lat: "-35.000", lng: "-71.260" });
    notify("✔ Reporte ciudadano registrado correctamente.");
    await loadData();
  }

  // RF-03 — Emitir alerta masiva
  async function emitAlert(e) {
    e.preventDefault();
    const res = await postJson("/api/alerts", alertForm);
    if (!res.ok) { notify("Faltan datos para emitir la alerta.", "warn"); return; }
    const created = await res.json();
    setAlertForm({ title: "", sector: "", severity: "Alta", channel: "Web/SMS" });
    notify(`🚨 Alerta emitida — ${created.recipients} destinatarios notificados.`);
    await loadData();
  }

  // RF-05 — Actualizar estado / asignar brigada
  async function updateReport(id, field, value) {
    const body = { [field]: value };
    const res = await patchJson(`/api/reports/${id}`, body);
    if (!res.ok) { notify("Error al actualizar el reporte.", "warn"); return; }
    notify("✔ Reporte actualizado.");
    await loadData();
  }

  const brigadeNames = data.brigades.map((b) => b.name);

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
            <h1><span className="green">SIG</span><span className="fire">IF</span></h1>
            <p>Sistema Integrado de Gestión de Incendios Forestales — detecta focos, coordina brigadas, emite alertas y consulta integraciones mock de Bomberos y SENAPRED.</p>
          </div>
          <div className="hero-kpi">
            <span className="kpi-label">Objetivo detección</span>
            <span className="kpi-value">&lt;5</span>
            <span className="kpi-sub">minutos · actual: 35 min promedio</span>
          </div>
        </section>

        {message.text && <div className={`message message-${message.type}`}>{message.text}</div>}

        {/* ── MÉTRICAS ── */}
        <div className="metrics">
          <Metric label="Focos activos"       value={data.summary?.activeReports ?? "—"}   color="red"    />
          <Metric label="Focos críticos"      value={data.summary?.criticalReports ?? "—"} color="yellow" />
          <Metric label="Brigadas en terreno" value={data.summary?.brigadesInField ?? "—"} color="green"  />
          <Metric label="Alertas emitidas"    value={data.summary?.alertsSent ?? "—"}       color="navy"   />
        </div>

        {/* ── TABS ── */}
        <div className="tabs">
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "reportes",  label: "🔥 RF-01 Reportes" },
            { id: "mapa",      label: "🗺 RF-02 Mapa GIS" },
            { id: "alertas",   label: "🚨 RF-03 Alertas" },
            { id: "coord",     label: "🚒 RF-05 Coordinación" },
            { id: "apis",      label: "🔗 RF-04 Integraciones" },
          ].map((t) => (
            <button key={t.id} className={`tab-btn${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="section-wrap">

          {/* ── TAB: DASHBOARD ── */}
          {activeTab === "dashboard" && (
            <>
              <div className="grid three-columns">
                <Panel title="📊 Reportes por severidad" subtitle="Distribución actual">
                  {data.stats?.bySeverity?.map((item) => (
                    <StatBar key={item.severity} label={item.severity} count={item.count}
                      total={data.reports.length} colorClass={`sev-bar-${item.severity.toLowerCase()}`} />
                  ))}
                </Panel>
                <Panel title="📋 Reportes por estado" subtitle="Estado operacional">
                  {data.stats?.byStatus?.map((item) => (
                    <StatBar key={item.status} label={item.status} count={item.count}
                      total={data.reports.length} colorClass="sev-bar-media" />
                  ))}
                </Panel>
                <Panel title="🌲 Zonas de riesgo" subtitle="Base para planificación preventiva">
                  <CompactList items={data.riskZones.map((z) => `${z.risk} — ${z.name}: ${z.reason}`)} />
                </Panel>
              </div>
              <div className="grid two-columns">
                <Panel title="👥 Actores del sistema" subtitle="Usuarios que operarán SIGIF">
                  <CompactList items={data.users.map((u) => `${u.role}: ${u.name} — ${u.access}`)} />
                </Panel>
                <Panel title="🏛 Estado SENAPRED" subtitle="RF-04 — alerta regional">
                  <ApiCard data={data.senapred} />
                </Panel>
              </div>
            </>
          )}

          {/* ── TAB: RF-01 REPORTES ── */}
          {activeTab === "reportes" && (
            <div className="grid two-columns">
              <Panel title="🔥 RF-01 — Reporte ciudadano" subtitle="Canal formal con geolocalización mock">
                <form onSubmit={createReport} className="report-form">
                  <label>Sector
                    <input value={reportForm.sector} onChange={(e) => setReportForm({ ...reportForm, sector: e.target.value })} placeholder="Ej: Los Aromos" />
                  </label>
                  <label>Tipo de incidente
                    <select value={reportForm.type} onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}>
                      <option>Humo visible</option>
                      <option>Foco forestal</option>
                      <option>Quema no autorizada</option>
                      <option>Riesgo preventivo</option>
                    </select>
                  </label>
                  <label>Severidad
                    <select value={reportForm.severity} onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}>
                      <option>Baja</option><option>Media</option><option>Alta</option><option>Critica</option>
                    </select>
                  </label>
                  <label>Nombre reportante (opcional)
                    <input value={reportForm.reporterName} onChange={(e) => setReportForm({ ...reportForm, reporterName: e.target.value })} placeholder="Nombre o anónimo" />
                  </label>
                  <div className="form-row">
                    <label>Latitud  <input value={reportForm.lat} onChange={(e) => setReportForm({ ...reportForm, lat: e.target.value })} /></label>
                    <label>Longitud <input value={reportForm.lng} onChange={(e) => setReportForm({ ...reportForm, lng: e.target.value })} /></label>
                  </div>
                  <button type="submit">Registrar reporte</button>
                </form>
              </Panel>
              <Panel title="📋 Reportes registrados" subtitle="Todos los reportes en memoria">
                <ReportsTable reports={data.reports} brigades={brigadeNames} onUpdate={updateReport} />
              </Panel>
            </div>
          )}

          {/* ── TAB: RF-02 MAPA ── */}
          {activeTab === "mapa" && (
            <div className="grid two-columns">
              <Panel title="🗺 RF-02 — Mapa GIS simplificado" subtitle="Focos activos, brigadas y zonas de riesgo (mock)">
                <div className="map-box">
                  {data.reports.filter((r) => r.status === "Activo").slice(0, 8).map((r) => (
                    <MapPoint key={r.id} item={r} type="fire" />
                  ))}
                  {data.brigades.map((b) => <MapPoint key={b.id} item={b} type="brigade" />)}
                  {data.riskZones.map((z) => <MapPoint key={z.id} item={z} type="risk" />)}
                </div>
                <div className="legend">
                  <span className="dot fire" /> Foco activo
                  <span className="dot brigade" /> Brigada/Bomberos
                  <span className="dot risk" /> Zona de riesgo
                </div>
              </Panel>
              <Panel title="🚒 Estado de brigadas" subtitle="Posición y tarea actual">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Brigada", "Estado", "Tarea actual", "Efectivos"].map((h) => (
                        <th key={h} style={{ padding: "9px 10px", background: "var(--green-dark)", color: "#fff", fontSize: ".8rem", textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.brigades.map((b) => (
                      <tr key={b.id}>
                        <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--border)", fontSize: ".87rem" }}>{b.name}</td>
                        <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--border)" }}>
                          <span className={`badge badge-${b.status === "Disponible" ? "media" : b.status === "En combate" ? "critica" : "alta"}`}>{b.status}</span>
                        </td>
                        <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--border)", fontSize: ".87rem" }}>{b.currentTask}</td>
                        <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--border)", fontSize: ".87rem" }}>{b.members}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </div>
          )}

          {/* ── TAB: RF-03 ALERTAS ── */}
          {activeTab === "alertas" && (
            <div className="grid two-columns">
              <Panel title="🚨 RF-03 — Emitir alerta masiva" subtitle="Notificación a la comunidad por Web, SMS o App">
                <form onSubmit={emitAlert} className="report-form">
                  <label>Título de la alerta
                    <input value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} placeholder="Ej: Alerta roja sector norte" />
                  </label>
                  <label>Sector afectado
                    <input value={alertForm.sector} onChange={(e) => setAlertForm({ ...alertForm, sector: e.target.value })} placeholder="Ej: Pinar Alto" />
                  </label>
                  <label>Severidad
                    <select value={alertForm.severity} onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}>
                      <option>Media</option><option>Alta</option><option>Critica</option>
                    </select>
                  </label>
                  <label>Canal de notificación
                    <select value={alertForm.channel} onChange={(e) => setAlertForm({ ...alertForm, channel: e.target.value })}>
                      <option>Web/SMS</option><option>Web</option><option>App</option><option>SMS</option>
                    </select>
                  </label>
                  <button type="submit" style={{ background: "var(--red-deep)" }}>🚨 Emitir alerta masiva</button>
                </form>
                <p className="rf-note">Los destinatarios se estiman automáticamente según severidad: Crítica → 1.200, Alta → 500, Media → 150.</p>
              </Panel>
              <Panel title="📢 Alertas emitidas" subtitle="Historial de notificaciones masivas">
                <AlertList alerts={data.alerts} />
              </Panel>
            </div>
          )}

          {/* ── TAB: RF-05 COORDINACIÓN ── */}
          {activeTab === "coord" && (
            <Panel title="🚒 RF-05 — Coordinación de brigadas" subtitle="Asignar brigada y actualizar estado de cada reporte activo">
              <CoordTable reports={data.reports} brigades={brigadeNames} onUpdate={updateReport} />
            </Panel>
          )}

          {/* ── TAB: RF-04 APIS ── */}
          {activeTab === "apis" && (
            <div className="grid two-columns">
              <Panel title="🏛 RF-04 — API SENAPRED mock" subtitle="Estado regional y nivel de alerta simulado">
                <ApiCard data={data.senapred} />
              </Panel>
              <Panel title="🚒 RF-04 — API Bomberos mock" subtitle="Recursos operativos disponibles simulados">
                <ApiCard data={data.bomberos} />
              </Panel>
            </div>
          )}

        </div>
      </main>
    </>
  );
}

// ── Metric ────────────────────────────────────────────────────────────
function Metric({ label, value, color }) {
  return (
    <article className={`metric ${color}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────
function Panel({ title, subtitle, children }) {
  return (
    <article className="panel">
      <div className="panel-header"><h2>{title}</h2><p>{subtitle}</p></div>
      <div className="panel-body">{children}</div>
    </article>
  );
}

// ── CompactList ───────────────────────────────────────────────────────
function CompactList({ items }) {
  return (
    <ul className="compact-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

// ── StatBar ───────────────────────────────────────────────────────────
function StatBar({ label, count, total, colorClass }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="stat-bar-row">
      <div className="stat-bar-label"><span>{label}</span><strong>{count}</strong></div>
      <div className="stat-bar-track">
        <div className={`stat-bar-fill ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── AlertList ─────────────────────────────────────────────────────────
function AlertList({ alerts }) {
  if (!alerts.length) return <p style={{ color: "var(--text-muted)" }}>Sin alertas emitidas.</p>;
  return (
    <ul className="compact-list">
      {alerts.map((a) => (
        <li key={a.id} className={`alert-item sev-${a.severity?.toLowerCase()}`}>
          <span className={`badge badge-${a.severity?.toLowerCase()}`}>{a.severity}</span>
          &nbsp;<strong>{a.title}</strong> — {a.sector}
          <br />
          <small style={{ color: "var(--text-muted)" }}>{a.channel} · {a.recipients} destinatarios · {new Date(a.sentAt).toLocaleString("es-CL")}</small>
        </li>
      ))}
    </ul>
  );
}

// ── ReportsTable (compacta para RF-01) ────────────────────────────────
function ReportsTable({ reports, brigades, onUpdate }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {["Sector", "Tipo", "Severidad", "Estado", "Brigada"].map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id} className={`sev-${r.severity?.toLowerCase()}`}>
              <td>{r.sector}</td>
              <td style={{ fontSize: ".82rem" }}>{r.type}</td>
              <td><SevBadge val={r.severity} /></td>
              <td>
                <select className="inline-select" value={r.status}
                  onChange={(e) => onUpdate(r.id, "status", e.target.value)}>
                  {["Pendiente","En verificacion","Activo","Controlado","Descartado"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td>
                <select className="inline-select" value={r.assignedBrigade}
                  onChange={(e) => onUpdate(r.id, "assignedBrigade", e.target.value)}>
                  <option>Sin asignar</option>
                  {brigades.map((b) => <option key={b}>{b}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── CoordTable (RF-05 — sólo focos activos/pendientes) ────────────────
function CoordTable({ reports, brigades, onUpdate }) {
  const active = reports.filter((r) => ["Activo", "Pendiente", "En verificacion"].includes(r.status));
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {["#", "Sector", "Tipo", "Severidad", "Estado", "Brigada asignada", "Reportado"].map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {active.map((r) => (
            <tr key={r.id} className={`sev-${r.severity?.toLowerCase()}`}>
              <td style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>{r.id}</td>
              <td><strong>{r.sector}</strong></td>
              <td style={{ fontSize: ".82rem" }}>{r.type}</td>
              <td><SevBadge val={r.severity} /></td>
              <td>
                <select className="inline-select" value={r.status}
                  onChange={(e) => onUpdate(r.id, "status", e.target.value)}>
                  {["Pendiente","En verificacion","Activo","Controlado","Descartado"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td>
                <select className="inline-select brigade-select" value={r.assignedBrigade}
                  onChange={(e) => onUpdate(r.id, "assignedBrigade", e.target.value)}>
                  <option>Sin asignar</option>
                  {brigades.map((b) => <option key={b}>{b}</option>)}
                </select>
              </td>
              <td style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>
                {new Date(r.reportedAt).toLocaleString("es-CL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
              </td>
            </tr>
          ))}
          {active.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>Sin reportes activos o pendientes.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ── SevBadge ──────────────────────────────────────────────────────────
function SevBadge({ val }) {
  const cls = { critica: "badge-critica", alta: "badge-alta", media: "badge-media", baja: "badge-baja" }[val?.toLowerCase()] || "";
  return <span className={`badge ${cls}`}>{val}</span>;
}

// ── ApiCard ───────────────────────────────────────────────────────────
function ApiCard({ data }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>Cargando...</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

// ── MapPoint ──────────────────────────────────────────────────────────
function MapPoint({ item, type }) {
  const left = type === "fire"  ? 20 + Math.abs(item.lng + 71.36) * 250
             : type === "risk"  ? 15 + Math.abs(item.lng + 71.36) * 230
             :                    45 + Math.abs(item.lng + 71.31) * 220;
  const top  = type === "fire"  ? 20 + Math.abs(item.lat + 34.94) * 520
             : type === "risk"  ? 25 + Math.abs(item.lat + 34.94) * 490
             :                    30 + Math.abs(item.lat + 34.96) * 470;
  return (
    <span className={`map-point ${type}`}
      style={{ left: `${Math.min(left, 88)}%`, top: `${Math.min(top, 82)}%` }}
      title={item.sector || item.name} />
  );
}

createRoot(document.getElementById("root")).render(<App />);
