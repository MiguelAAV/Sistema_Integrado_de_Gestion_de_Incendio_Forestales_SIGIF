import cors from "cors";
import express from "express";

const fireReports = [
  { id: 1, sector: "Los Aromos", type: "Humo visible", severity: "Alta", status: "Activo", source: "Ciudadano", reportedAt: "2026-01-18T14:25:00", lat: -34.982, lng: -71.235, assignedBrigade: "Brigada Norte" },
  { id: 2, sector: "Camino El Molino", type: "Quema no autorizada", severity: "Media", status: "En verificacion", source: "Ciudadano", reportedAt: "2026-01-18T15:10:00", lat: -35.011, lng: -71.278, assignedBrigade: "Brigada Sur" },
  { id: 3, sector: "Pinar Alto", type: "Foco forestal", severity: "Critica", status: "Activo", source: "Bomberos", reportedAt: "2026-01-18T15:40:00", lat: -34.956, lng: -71.304, assignedBrigade: "Brigada Norte" },
  { id: 4, sector: "Rinconada", type: "Columna de humo", severity: "Baja", status: "Controlado", source: "Brigada", reportedAt: "2026-01-17T18:05:00", lat: -35.034, lng: -71.226, assignedBrigade: "Brigada Sur" },
  { id: 5, sector: "La Quebrada", type: "Riesgo preventivo", severity: "Media", status: "Pendiente", source: "Ciudadano", reportedAt: "2026-01-18T12:15:00", lat: -34.998, lng: -71.331, assignedBrigade: "Sin asignar" },
  { id: 6, sector: "Villa El Roble", type: "Foco cercano a viviendas", severity: "Critica", status: "Activo", source: "SENAPRED", reportedAt: "2026-01-18T16:02:00", lat: -35.046, lng: -71.291, assignedBrigade: "Brigada Sur" },
  { id: 7, sector: "Santa Teresa", type: "Fogata en zona forestal", severity: "Media", status: "En verificacion", source: "Ciudadano", reportedAt: "2026-01-18T13:35:00", lat: -35.021, lng: -71.356, assignedBrigade: "Brigada Sur" },
  { id: 8, sector: "El Maiten", type: "Humo disperso", severity: "Baja", status: "Descartado", source: "Ciudadano", reportedAt: "2026-01-16T11:15:00", lat: -34.945, lng: -71.257, assignedBrigade: "Brigada Norte" },
  { id: 9, sector: "Cuesta Verde", type: "Foco forestal", severity: "Alta", status: "Activo", source: "Brigada", reportedAt: "2026-01-18T16:30:00", lat: -35.061, lng: -71.319, assignedBrigade: "Brigada Sur" },
  { id: 10, sector: "Laguna Chica", type: "Quema agricola", severity: "Media", status: "Controlado", source: "Bomberos", reportedAt: "2026-01-17T09:20:00", lat: -34.971, lng: -71.192, assignedBrigade: "Brigada Norte" }
];

const app = express();
const port = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.get("/api/reports", (_req, res) => res.json(fireReports));

app.post("/api/reports", (req, res) => {
  const { sector, type, severity, lat, lng, reporterName } = req.body;
  if (!sector || !type || !severity)
    return res.status(400).json({ message: "sector, type y severity son obligatorios" });

  const newReport = {
    id: fireReports.length + 1,
    sector, type, severity,
    status: "Pendiente",
    source: reporterName ? `Ciudadano: ${reporterName}` : "Ciudadano",
    reportedAt: new Date().toISOString(),
    lat: Number(lat) || -35.0, lng: Number(lng) || -71.26,
    assignedBrigade: "Sin asignar"
  };

  fireReports.unshift(newReport);
  res.status(201).json(newReport);
});

app.listen(port, () => {
  console.log(`[incidents] running at http://localhost:${port}`);
});
