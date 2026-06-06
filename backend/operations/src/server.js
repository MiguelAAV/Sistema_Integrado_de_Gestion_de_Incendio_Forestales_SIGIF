import cors from "cors";
import express from "express";

const users = [
  { id: 1, name: "Joaquin Rivas", role: "Alcalde", area: "Autoridad", access: "Dashboard ejecutivo y reportes" },
  { id: 2, name: "Carolina Cisternas", role: "Directora de Gestion de Riesgos", area: "Emergencias", access: "Mapa GIS, alertas y coordinacion" },
  { id: 3, name: "Patricio Castillo", role: "Director de Tecnologia", area: "TI", access: "Configuracion e integraciones" },
  { id: 4, name: "Brigada Norte", role: "Brigada municipal", area: "Terreno", access: "Focos asignados, estado y posicion" },
  { id: 5, name: "Brigada Sur", role: "Brigada municipal", area: "Terreno", access: "Focos asignados, estado y posicion" },
  { id: 6, name: "Vecina Los Aromos", role: "Ciudadana", area: "Comunidad", access: "Reporte ciudadano y alertas" },
  { id: 7, name: "Vecino El Molino", role: "Ciudadano", area: "Comunidad", access: "Reporte ciudadano y alertas" },
  { id: 8, name: "Operador Central", role: "Operador municipal", area: "Central SIGIF", access: "Validacion de reportes y despacho" },
  { id: 9, name: "Bomberos Valle del Sol", role: "Institucion externa", area: "Bomberos", access: "API mock de incidentes y recursos" },
  { id: 10, name: "SENAPRED Regional", role: "Organismo regulador", area: "SENAPRED", access: "API mock de alertas y estado regional" }
];

const brigades = [
  { id: 1, name: "Brigada Norte", status: "En ruta", members: 6, vehicle: "Camioneta B-01", lat: -34.972, lng: -71.248, currentTask: "Pinar Alto" },
  { id: 2, name: "Brigada Sur", status: "En combate", members: 7, vehicle: "Camioneta B-02", lat: -35.043, lng: -71.295, currentTask: "Villa El Roble" },
  { id: 3, name: "Brigada Central", status: "Disponible", members: 5, vehicle: "Camion aljibe C-01", lat: -35.000, lng: -71.260, currentTask: "Base municipal" }
];

const alerts = [
  { id: 1, title: "Alerta roja comunal", channel: "Web/SMS", sector: "Villa El Roble", severity: "Critica", sentAt: "2026-01-18T16:05:00", recipients: 1200 },
  { id: 2, title: "Evitar transito", channel: "Web", sector: "Pinar Alto", severity: "Alta", sentAt: "2026-01-18T15:44:00", recipients: 430 },
  { id: 3, title: "Reporte preventivo recibido", channel: "App", sector: "La Quebrada", severity: "Media", sentAt: "2026-01-18T12:16:00", recipients: 1 }
];

const riskZones = [
  { id: 1, name: "Plantaciones Pinar Alto", risk: "Critico", lat: -34.956, lng: -71.304, reason: "Pino y eucalipto con viento fuerte" },
  { id: 2, name: "Corredor Villa El Roble", risk: "Alto", lat: -35.046, lng: -71.291, reason: "Viviendas cercanas a masa forestal" },
  { id: 3, name: "Cuesta Verde", risk: "Alto", lat: -35.061, lng: -71.319, reason: "Acceso dificil para brigadas" },
  { id: 4, name: "La Quebrada", risk: "Medio", lat: -34.998, lng: -71.331, reason: "Historial de quemas no autorizadas" }
];

const evacuationPoints = [
  { id: 1, name: "Gimnasio Municipal", capacity: 500, lat: -35.005, lng: -71.255, status: "Activo", resources: "Agua, frazadas, primeros auxilios" },
  { id: 2, name: "Escuela Los Aromos", capacity: 300, lat: -34.988, lng: -71.238, status: "Activo", resources: "Agua, alimentos no perecibles" },
  { id: 3, name: "Sede Vecinal El Roble", capacity: 150, lat: -35.042, lng: -71.288, status: "Activo", resources: "Agua, comunicaciones" },
  { id: 4, name: "Cancha Cuesta Verde", capacity: 400, lat: -35.058, lng: -71.316, status: "Activo", resources: "Helipuerto temporal" },
  { id: 5, name: "Iglesia San Jorge", capacity: 200, lat: -35.025, lng: -71.245, status: "En preparacion", resources: "Sin recursos asignados" }
];

const app = express();
const port = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.get("/api/users", (_req, res) => res.json(users));
app.get("/api/brigades", (_req, res) => res.json(brigades));
app.get("/api/alerts", (_req, res) => res.json(alerts));
app.get("/api/risk-zones", (_req, res) => res.json(riskZones));
app.get("/api/evacuation-points", (_req, res) => res.json(evacuationPoints));

app.get("/api/summary", (_req, res) => {
  res.json({
    activeReports: 4,
    criticalReports: 2,
    brigadesInField: 2,
    alertsSent: alerts.length,
    averageDetectionMinutes: 35,
    targetDetectionMinutes: 5,
    citizenReportShare: "22%",
    expectedImpact: "Hasta 40% menos superficie afectada"
  });
});

app.listen(port, () => {
  console.log(`[operations] running at http://localhost:${port}`);
});
