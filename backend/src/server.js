import cors from "cors";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
// Importación de datos mock (simulados) iniciales desde mockData.js
import {
  alerts,
  brigades,
  firefighterIncidents,
  fireReports,
  riskZones,
  senapredEvents,
  users
} from "./mockData.js";

// Inicialización de la aplicación Express
const app = express();
// Configuración del puerto: usa la variable de entorno PORT o por defecto el puerto 4000
const port = process.env.PORT || 4000;

// Habilitación de CORS (Cross-Origin Resource Sharing) para permitir peticiones desde el frontend
app.use(cors());
// Habilitación del middleware para parsear cuerpos de peticiones en formato JSON
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────
// Endpoint básico de diagnóstico de salud del servicio de API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SIGIF MVP API", mode: "local-mock" });
});

// ── Summary ───────────────────────────────────────────────────────────
// Endpoint que calcula y retorna métricas de resumen para el panel de KPIs en el Dashboard
app.get("/api/summary", (_req, res) => {
  res.json({
    // Cuenta la cantidad de reportes con estado igual a "Activo"
    activeReports:           fireReports.filter((r) => r.status === "Activo").length,
    // Cuenta la cantidad de reportes cuya severidad es "Critica"
    criticalReports:         fireReports.filter((r) => r.severity === "Critica").length,
    // Cuenta las brigadas ocupadas (cualquier estado diferente a "Disponible")
    brigadesInField:         brigades.filter((b) => b.status !== "Disponible").length,
    // Total de alertas enviadas hasta el momento
    alertsSent:              alerts.length,
    averageDetectionMinutes: 35, // Tiempo de detección promedio histórico actual (en minutos)
    targetDetectionMinutes:  5,  // Meta del sistema (menos de 5 minutos)
    citizenReportShare:      "22%", // Porcentaje de reportes originados por la ciudadanía
    expectedImpact:          "Hasta 40% menos superficie afectada", // Beneficio proyectado
    totalReports:            fireReports.length, // Total de reportes en memoria
    // Cuenta los reportes ya controlados
    controlledReports:       fireReports.filter((r) => r.status === "Controlado").length,
    // Cuenta los reportes que están pendientes de verificar o atender
    pendingReports:          fireReports.filter((r) => r.status === "Pendiente").length,
  });
});

// ── Usuarios ──────────────────────────────────────────────────────────
// Endpoint para obtener la lista de usuarios y roles del sistema (actores municipales)
app.get("/api/users",      (_req, res) => res.json(users));

// ── Reportes ──────────────────────────────────────────────────────────
// Endpoint para obtener todos los reportes de incendios almacenados en memoria
app.get("/api/reports",    (_req, res) => res.json(fireReports));

// RF-01 — Crear reporte ciudadano
// Endpoint que maneja la creación de un nuevo reporte de incendio enviado por un ciudadano
app.post("/api/reports", (req, res) => {
  const { sector, type, severity, lat, lng, reporterName } = req.body;
  
  // Validación de campos obligatorios requeridos para el reporte
  if (!sector || !type || !severity) {
    return res.status(400).json({ message: "sector, type y severity son obligatorios" });
  }
  
  // Estructura del nuevo reporte
  const newReport = {
    id:              fireReports.length + 1, // Asignación de ID correlativo simple
    sector,
    type,
    severity,
    status:          "Pendiente", // Todo reporte ciudadano se inicia en estado 'Pendiente'
    // Identificación de la fuente del reporte
    source:          reporterName ? `Ciudadano: ${reporterName}` : "Ciudadano",
    reportedAt:      new Date().toISOString(), // Marca de tiempo actual en formato ISO
    lat:             Number(lat) || -35.0,     // Coordenada latitud (con fallback a -35.0)
    lng:             Number(lng) || -71.26,    // Coordenada longitud (con fallback a -71.26)
    assignedBrigade: "Sin asignar"             // Inicialmente sin brigada asignada
  };
  
  // Agregar al inicio del arreglo en memoria para que aparezca primero en el frontend
  fireReports.unshift(newReport);
  res.status(201).json(newReport);
});

// RF-05 — Actualizar estado y/o brigada asignada
// Endpoint para que el operador municipal actualice el estado o asigne recursos a un reporte
app.patch("/api/reports/:id", (req, res) => {
  const id = Number(req.params.id);
  const report = fireReports.find((r) => r.id === id);
  
  // Retorna error 404 si el ID no corresponde a ningún reporte existente
  if (!report) return res.status(404).json({ message: "Reporte no encontrado" });

  const { status, assignedBrigade } = req.body;
  // Actualización de campos si vienen especificados en el cuerpo de la petición
  if (status)          report.status          = status;
  if (assignedBrigade) report.assignedBrigade = assignedBrigade;
  report.updatedAt = new Date().toISOString(); // Actualiza la fecha de modificación

  res.json(report);
});

// ── Brigadas ──────────────────────────────────────────────────────────
// Endpoint para obtener la lista de brigadas municipales y su estado actual
app.get("/api/brigades",   (_req, res) => res.json(brigades));

// ── Alertas ───────────────────────────────────────────────────────────
// Endpoint para obtener el historial de alertas masivas emitidas
app.get("/api/alerts",     (_req, res) => res.json(alerts));

// RF-03 — Emitir alerta masiva
// Endpoint que maneja la emisión de alertas a la población de un sector específico
app.post("/api/alerts", (req, res) => {
  const { title, sector, severity, channel } = req.body;
  
  // Validación de campos obligatorios
  if (!title || !sector || !severity) {
    return res.status(400).json({ message: "title, sector y severity son obligatorios" });
  }
  
  // Estructura de la alerta comunal emitida
  const newAlert = {
    id:         alerts.length + 1,
    title,
    sector,
    severity,
    channel:    channel || "Web", // Canal de emisión (Web, SMS, App)
    sentAt:     new Date().toISOString(),
    // Estimación simulada de destinatarios en base a la severidad de la alerta
    recipients: severity === "Critica" ? 1200 : severity === "Alta" ? 500 : 150
  };
  
  // Agregar al inicio del listado en memoria
  alerts.unshift(newAlert);
  res.status(201).json(newAlert);
});

// ── Zonas de riesgo ───────────────────────────────────────────────────
// Endpoint para obtener las zonas geográficas con riesgos forestales pre-identificadas
app.get("/api/risk-zones", (_req, res) => res.json(riskZones));

// ── Stats históricos para dashboard ejecutivo ─────────────────────────
// Endpoint que agrupa estadísticas consolidadas para gráficos e indicadores del Alcalde
app.get("/api/stats", (_req, res) => {
  // Mapea la cantidad de reportes para cada nivel de severidad
  const bySeverity = ["Critica", "Alta", "Media", "Baja"].map((sev) => ({
    severity: sev,
    count:    fireReports.filter((r) => r.severity === sev).length
  }));
  // Mapea la cantidad de reportes para cada estado operacional
  const byStatus = ["Activo", "Pendiente", "En verificacion", "Controlado", "Descartado"].map((st) => ({
    status: st,
    count:  fireReports.filter((r) => r.status === st).length
  }));
  res.json({ bySeverity, byStatus, totalAlerts: alerts.length, totalBrigades: brigades.length });
});

// ── Integraciones mock ────────────────────────────────────────────────
// Endpoints que simulan la integración de datos con otros servicios de emergencia

// Retorna eventos activos administrados por SENAPRED
app.get("/api/mock/senapred/events",    (_req, res) => res.json({ provider: "SENAPRED mock", events: senapredEvents }));

// Retorna el estado e indicadores generales de riesgo meteorológico regional proveídos por SENAPRED
app.get("/api/mock/senapred/status",    (_req, res) => res.json({
  provider:       "SENAPRED mock",
  commune:        "Valle del Sol",
  regionalAlert:  "Alerta Roja",
  weatherRisk:    "Muy alto",
  recommendation: "Mantener monitoreo comunal y activar rutas de evacuacion preventivas"
}));

// Retorna incidentes en curso atendidos por el Cuerpo de Bomberos
app.get("/api/mock/bomberos/incidents", (_req, res) => res.json({ provider: "Bomberos mock", incidents: firefighterIncidents }));

// Retorna los recursos operativos (unidades, camiones, personal) disponibles en la central de Bomberos
app.get("/api/mock/bomberos/resources", (_req, res) => res.json({
  provider:         "Bomberos mock",
  availableUnits:   3,
  waterTrucks:      1,
  volunteersOnDuty: 18,
  radioChannel:     "VDS-B1"
}));

// Servir el frontend compilado en producción (Vite React) de forma estática
const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../../frontend/dist");
app.use(express.static(distPath));

// Cualquier otra ruta no manejada por la API cargará el index.html principal del SPA
app.get("*", (_req, res) => res.sendFile(join(distPath, "index.html")));

// Levanta el servidor en el puerto configurado
app.listen(port, () => console.log(`SIGIF running at http://localhost:${port}`));
