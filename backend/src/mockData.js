export const users = [
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

export const fireReports = [
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

export const brigades = [
  { id: 1, name: "Brigada Norte", status: "En ruta", members: 6, vehicle: "Camioneta B-01", lat: -34.972, lng: -71.248, currentTask: "Pinar Alto" },
  { id: 2, name: "Brigada Sur", status: "En combate", members: 7, vehicle: "Camioneta B-02", lat: -35.043, lng: -71.295, currentTask: "Villa El Roble" },
  { id: 3, name: "Brigada Central", status: "Disponible", members: 5, vehicle: "Camion aljibe C-01", lat: -35.000, lng: -71.260, currentTask: "Base municipal" }
];

export const alerts = [
  { id: 1, title: "Alerta roja comunal", channel: "Web/SMS", sector: "Villa El Roble", severity: "Critica", sentAt: "2026-01-18T16:05:00", recipients: 1200 },
  { id: 2, title: "Evitar transito", channel: "Web", sector: "Pinar Alto", severity: "Alta", sentAt: "2026-01-18T15:44:00", recipients: 430 },
  { id: 3, title: "Reporte preventivo recibido", channel: "App", sector: "La Quebrada", severity: "Media", sentAt: "2026-01-18T12:16:00", recipients: 1 }
];

export const riskZones = [
  { id: 1, name: "Plantaciones Pinar Alto", risk: "Critico", lat: -34.956, lng: -71.304, reason: "Pino y eucalipto con viento fuerte" },
  { id: 2, name: "Corredor Villa El Roble", risk: "Alto", lat: -35.046, lng: -71.291, reason: "Viviendas cercanas a masa forestal" },
  { id: 3, name: "Cuesta Verde", risk: "Alto", lat: -35.061, lng: -71.319, reason: "Acceso dificil para brigadas" },
  { id: 4, name: "La Quebrada", risk: "Medio", lat: -34.998, lng: -71.331, reason: "Historial de quemas no autorizadas" }
];

export const senapredEvents = [
  { id: "SNP-001", level: "Alerta Roja", commune: "Valle del Sol", status: "Vigente", resources: "Coordinacion regional activada" },
  { id: "SNP-002", level: "Alerta Amarilla", commune: "San Jorge Rural", status: "Monitoreo", resources: "Evaluacion preventiva" },
  { id: "SNP-003", level: "Informativa", commune: "Valle del Sol", status: "Cerrada", resources: "Reporte meteorologico archivado" }
];

export const firefighterIncidents = [
  { id: "BMB-101", unit: "Primera Compania", sector: "Pinar Alto", status: "Despachado", etaMinutes: 8 },
  { id: "BMB-102", unit: "Segunda Compania", sector: "Villa El Roble", status: "En terreno", etaMinutes: 0 },
  { id: "BMB-103", unit: "Unidad Aljibe", sector: "Cuesta Verde", status: "Solicitado", etaMinutes: 18 }
];

export const mockCredentials = [
  { email: "j.rivas@municipalidad.cl", password: "admin123", userId: 1, role: "Funcionario" },
  { email: "c.cisternas@municipalidad.cl", password: "admin123", userId: 2, role: "Funcionario" },
  { email: "p.castillo@municipalidad.cl", password: "admin123", userId: 3, role: "Funcionario" },
  { email: "brigada.norte@municipalidad.cl", password: "brigada123", userId: 4, role: "Funcionario" },
  { email: "brigada.sur@municipalidad.cl", password: "brigada123", userId: 5, role: "Funcionario" },
  { email: "operador@municipalidad.cl", password: "operador123", userId: 8, role: "Funcionario" }
];

export const registeredVecinos = [
  {
    id: 101,
    name: "Maria Lopez Diaz",
    role: "Vecino",
    area: "Comunidad",
    nombre: "Maria",
    apellidoPaterno: "Lopez",
    apellidoMaterno: "Diaz",
    rut: "22222222-2",
    telefono: "987654321",
    contrasena: "mimaria123",
    direccion: "Calle Los Olivos 456",
    fechaNacimiento: "1990-05-15",
    fotoPerfil: "",
    email: "maria.lopez@correo.cl",
    genero: "Femenino",
    lat: -35.01,
    lng: -71.27,
    acceptedTerms: true,
    registeredAt: "2026-01-15T10:00:00.000Z"
  }
];

export const evacuationPoints = [
  { id: 1, name: "Gimnasio Municipal", capacity: 500, lat: -35.005, lng: -71.255, status: "Activo", resources: "Agua, frazadas, primeros auxilios" },
  { id: 2, name: "Escuela Los Aromos", capacity: 300, lat: -34.988, lng: -71.238, status: "Activo", resources: "Agua, alimentos no perecibles" },
  { id: 3, name: "Sede Vecinal El Roble", capacity: 150, lat: -35.042, lng: -71.288, status: "Activo", resources: "Agua, comunicaciones" },
  { id: 4, name: "Cancha Cuesta Verde", capacity: 400, lat: -35.058, lng: -71.316, status: "Activo", resources: "Helipuerto temporal" },
  { id: 5, name: "Iglesia San Jorge", capacity: 200, lat: -35.025, lng: -71.245, status: "En preparacion", resources: "Sin recursos asignados" }
];
