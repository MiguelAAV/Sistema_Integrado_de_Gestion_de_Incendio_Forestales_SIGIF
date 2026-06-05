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

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SIGIF MVP API", mode: "local-mock" });
});

app.get("/api/summary", (_req, res) => {
  const activeReports = fireReports.filter((report) => report.status === "Activo");
  const criticalReports = fireReports.filter((report) => report.severity === "Critica");

  res.json({
    activeReports: activeReports.length,
    criticalReports: criticalReports.length,
    brigadesInField: brigades.filter((brigade) => brigade.status !== "Disponible").length,
    alertsSent: alerts.length,
    averageDetectionMinutes: 35,
    targetDetectionMinutes: 5,
    citizenReportShare: "22%",
    expectedImpact: "Hasta 40% menos superficie afectada"
  });
});

app.get("/api/users", (_req, res) => res.json(users));
app.get("/api/reports", (_req, res) => res.json(fireReports));
app.get("/api/brigades", (_req, res) => res.json(brigades));
app.get("/api/alerts", (_req, res) => res.json(alerts));
app.get("/api/risk-zones", (_req, res) => res.json(riskZones));

app.post("/api/reports", (req, res) => {
  const { sector, type, severity, lat, lng, reporterName } = req.body;

  if (!sector || !type || !severity) {
    return res.status(400).json({ message: "sector, type y severity son obligatorios" });
  }

  const newReport = {
    id: fireReports.length + 1,
    sector,
    type,
    severity,
    status: "Pendiente",
    source: reporterName ? `Ciudadano: ${reporterName}` : "Ciudadano",
    reportedAt: new Date().toISOString(),
    lat: Number(lat) || -35.0,
    lng: Number(lng) || -71.26,
    assignedBrigade: "Sin asignar"
  };

  fireReports.unshift(newReport);
  res.status(201).json(newReport);
});

app.get("/api/mock/senapred/events", (_req, res) => {
  res.json({ provider: "SENAPRED mock", events: senapredEvents });
});

app.get("/api/mock/senapred/status", (_req, res) => {
  res.json({
    provider: "SENAPRED mock",
    commune: "Valle del Sol",
    regionalAlert: "Alerta Roja",
    weatherRisk: "Muy alto",
    recommendation: "Mantener monitoreo comunal y activar rutas de evacuacion preventivas"
  });
});

app.get("/api/mock/bomberos/incidents", (_req, res) => {
  res.json({ provider: "Bomberos mock", incidents: firefighterIncidents });
});

app.get("/api/mock/bomberos/resources", (_req, res) => {
  res.json({
    provider: "Bomberos mock",
    availableUnits: 3,
    waterTrucks: 1,
    volunteersOnDuty: 18,
    radioChannel: "VDS-B1"
  });
});

app.listen(port, () => {
  console.log(`SIGIF backend running at http://localhost:${port}`);
});
