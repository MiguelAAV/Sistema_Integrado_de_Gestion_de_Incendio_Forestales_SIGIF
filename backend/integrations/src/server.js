import cors from "cors";
import express from "express";

const senapredEvents = [
  { id: "SNP-001", level: "Alerta Roja", commune: "Valle del Sol", status: "Vigente", resources: "Coordinacion regional activada" },
  { id: "SNP-002", level: "Alerta Amarilla", commune: "San Jorge Rural", status: "Monitoreo", resources: "Evaluacion preventiva" },
  { id: "SNP-003", level: "Informativa", commune: "Valle del Sol", status: "Cerrada", resources: "Reporte meteorologico archivado" }
];

const firefighterIncidents = [
  { id: "BMB-101", unit: "Primera Compania", sector: "Pinar Alto", status: "Despachado", etaMinutes: 8 },
  { id: "BMB-102", unit: "Segunda Compania", sector: "Villa El Roble", status: "En terreno", etaMinutes: 0 },
  { id: "BMB-103", unit: "Unidad Aljibe", sector: "Cuesta Verde", status: "Solicitado", etaMinutes: 18 }
];

const app = express();
const port = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

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
    availableUnits: 3, waterTrucks: 1, volunteersOnDuty: 18, radioChannel: "VDS-B1"
  });
});

app.listen(port, () => {
  console.log(`[integrations] running at http://localhost:${port}`);
});
