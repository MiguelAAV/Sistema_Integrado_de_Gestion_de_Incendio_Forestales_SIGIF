import cors from "cors";
import express from "express";
import {
  alerts,
  brigades,
  firefighterIncidents,
  fireReports,
  riskZones,
  senapredEvents,
  users
} from "./mockData.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SIGIF MVP API", mode: "local-mock" });
});

// ── Summary ───────────────────────────────────────────────────────────
app.get("/api/summary", (_req, res) => {
  res.json({
    activeReports:           fireReports.filter((r) => r.status === "Activo").length,
    criticalReports:         fireReports.filter((r) => r.severity === "Critica").length,
    brigadesInField:         brigades.filter((b) => b.status !== "Disponible").length,
    alertsSent:              alerts.length,
    averageDetectionMinutes: 35,
    targetDetectionMinutes:  5,
    citizenReportShare:      "22%",
    expectedImpact:          "Hasta 40% menos superficie afectada",
    totalReports:            fireReports.length,
    controlledReports:       fireReports.filter((r) => r.status === "Controlado").length,
    pendingReports:          fireReports.filter((r) => r.status === "Pendiente").length,
  });
});

// ── Usuarios ──────────────────────────────────────────────────────────
app.get("/api/users",      (_req, res) => res.json(users));

// ── Reportes ──────────────────────────────────────────────────────────
app.get("/api/reports",    (_req, res) => res.json(fireReports));

// RF-01 — Crear reporte ciudadano
app.post("/api/reports", (req, res) => {
  const { sector, type, severity, lat, lng, reporterName } = req.body;
  if (!sector || !type || !severity) {
    return res.status(400).json({ message: "sector, type y severity son obligatorios" });
  }
  const newReport = {
    id:              fireReports.length + 1,
    sector,
    type,
    severity,
    status:          "Pendiente",
    source:          reporterName ? `Ciudadano: ${reporterName}` : "Ciudadano",
    reportedAt:      new Date().toISOString(),
    lat:             Number(lat) || -35.0,
    lng:             Number(lng) || -71.26,
    assignedBrigade: "Sin asignar"
  };
  fireReports.unshift(newReport);
  res.status(201).json(newReport);
});

// RF-05 — Actualizar estado y/o brigada asignada
app.patch("/api/reports/:id", (req, res) => {
  const id = Number(req.params.id);
  const report = fireReports.find((r) => r.id === id);
  if (!report) return res.status(404).json({ message: "Reporte no encontrado" });

  const { status, assignedBrigade } = req.body;
  if (status)          report.status          = status;
  if (assignedBrigade) report.assignedBrigade = assignedBrigade;
  report.updatedAt = new Date().toISOString();

  res.json(report);
});

// ── Brigadas ──────────────────────────────────────────────────────────
app.get("/api/brigades",   (_req, res) => res.json(brigades));

// ── Alertas ───────────────────────────────────────────────────────────
app.get("/api/alerts",     (_req, res) => res.json(alerts));

// RF-03 — Emitir alerta masiva
app.post("/api/alerts", (req, res) => {
  const { title, sector, severity, channel } = req.body;
  if (!title || !sector || !severity) {
    return res.status(400).json({ message: "title, sector y severity son obligatorios" });
  }
  const newAlert = {
    id:         alerts.length + 1,
    title,
    sector,
    severity,
    channel:    channel || "Web",
    sentAt:     new Date().toISOString(),
    recipients: severity === "Critica" ? 1200 : severity === "Alta" ? 500 : 150
  };
  alerts.unshift(newAlert);
  res.status(201).json(newAlert);
});

// ── Zonas de riesgo ───────────────────────────────────────────────────
app.get("/api/risk-zones", (_req, res) => res.json(riskZones));

// ── Stats históricos para dashboard ejecutivo ─────────────────────────
app.get("/api/stats", (_req, res) => {
  const bySeverity = ["Critica", "Alta", "Media", "Baja"].map((sev) => ({
    severity: sev,
    count:    fireReports.filter((r) => r.severity === sev).length
  }));
  const byStatus = ["Activo", "Pendiente", "En verificacion", "Controlado", "Descartado"].map((st) => ({
    status: st,
    count:  fireReports.filter((r) => r.status === st).length
  }));
  res.json({ bySeverity, byStatus, totalAlerts: alerts.length, totalBrigades: brigades.length });
});

// ── Integraciones mock ────────────────────────────────────────────────
app.get("/api/mock/senapred/events",    (_req, res) => res.json({ provider: "SENAPRED mock", events: senapredEvents }));
app.get("/api/mock/senapred/status",    (_req, res) => res.json({
  provider:       "SENAPRED mock",
  commune:        "Valle del Sol",
  regionalAlert:  "Alerta Roja",
  weatherRisk:    "Muy alto",
  recommendation: "Mantener monitoreo comunal y activar rutas de evacuacion preventivas"
}));
app.get("/api/mock/bomberos/incidents", (_req, res) => res.json({ provider: "Bomberos mock", incidents: firefighterIncidents }));
app.get("/api/mock/bomberos/resources", (_req, res) => res.json({
  provider:         "Bomberos mock",
  availableUnits:   3,
  waterTrucks:      1,
  volunteersOnDuty: 18,
  radioChannel:     "VDS-B1"
}));

app.listen(port, () => console.log(`SIGIF backend running at http://localhost:${port}`));
