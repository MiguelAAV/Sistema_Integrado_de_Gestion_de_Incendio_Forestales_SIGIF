import cors from "cors";
import express from "express";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  alerts,
  brigades,
  evacuationPoints,
  firefighterIncidents,
  fireReports,
  mockCredentials,
  registeredVecinos as mockVecinos,
  riskZones,
  senapredEvents,
  users
} from "./mockData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VECINOS_FILE = join(__dirname, "vecinos_registrados.json");

const registeredVecinos = [];

function loadVecinos() {
  if (existsSync(VECINOS_FILE)) {
    try {
      const data = JSON.parse(readFileSync(VECINOS_FILE, "utf-8"));
      registeredVecinos.push(...data);
      console.log(`Cargados ${data.length} vecinos registrados desde archivo.`);
    } catch {
      console.log("Archivo de vecinos corrupto, usando defaults.");
      registeredVecinos.push(...mockVecinos);
    }
  } else {
    registeredVecinos.push(...mockVecinos);
  }
}

function saveVecinos() {
  try {
    writeFileSync(VECINOS_FILE, JSON.stringify(registeredVecinos, null, 2), "utf-8");
  } catch (err) {
    console.error("Error guardando vecinos:", err.message);
  }
}

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

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
app.get("/api/evacuation-points", (_req, res) => res.json(evacuationPoints));

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

const authSessions = {};

app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;

  if (role === "Funcionario") {
    const cred = mockCredentials.find((credential) => credential.email === email && credential.password === password);

    if (!cred) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const user = users.find((usr) => usr.id === cred.userId);
    const token = `tok_${Date.now()}`;

    authSessions[token] = { user, role: "Funcionario" };
    return res.json({ token, user });
  }

  if (role === "Vecino") {
    const vecino = registeredVecinos.find((v) => v.rut === email);

    if (!vecino) {
      return res.status(401).json({ message: "Vecino no registrado. Crea una cuenta primero." });
    }

    if (vecino.contrasena !== password) {
      return res.status(401).json({ message: "Contrasena incorrecta" });
    }

    const token = `tok_${Date.now()}`;

    authSessions[token] = { user: vecino, role: "Vecino" };
    return res.json({ token, user: vecino });
  }

  res.status(400).json({ message: "Rol invalido" });
});

app.post("/api/auth/register", (req, res) => {
  const { nombre, apellidoPaterno, apellidoMaterno, rut, telefono, contrasena, email, genero, direccion, fechaNacimiento, fotoPerfil, lat, lng, acceptedTerms } = req.body;

  if (!acceptedTerms) {
    return res.status(400).json({ message: "Debe aceptar los terminos y condiciones" });
  }

  if (!nombre || !apellidoPaterno || !apellidoMaterno || !rut || !telefono || !contrasena) {
    return res.status(400).json({ message: "Nombre, apellidos, RUT, telefono y contrasena son obligatorios" });
  }

  const exists = registeredVecinos.find((v) => v.rut === rut);

  if (exists) {
    return res.status(409).json({ message: "RUT ya registrado" });
  }

  const newVecino = {
    id: registeredVecinos.length + 100,
    name: `${nombre} ${apellidoPaterno} ${apellidoMaterno}`,
    role: "Vecino",
    area: "Comunidad",
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    rut,
    telefono,
    contrasena,
    email: email || "",
    genero: genero || "",
    direccion: direccion || "",
    fechaNacimiento: fechaNacimiento || "",
    fotoPerfil: fotoPerfil || "",
    lat: lat || null,
    lng: lng || null,
    acceptedTerms: true,
    registeredAt: new Date().toISOString()
  };

  registeredVecinos.push(newVecino);
  saveVecinos();
  const token = `tok_${Date.now()}`;

  authSessions[token] = { user: newVecino, role: "Vecino" };
  res.status(201).json({ token, user: newVecino });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token || !authSessions[token]) {
    return res.status(401).json({ message: "No autenticado" });
  }

  res.json(authSessions[token]);
});

function findVecinoByToken(token) {
  const session = authSessions[token];
  if (!session || session.role !== "Vecino") return null;
  return registeredVecinos.find((v) => v.id === session.user.id);
}

app.put("/api/auth/profile", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  const vecino = findVecinoByToken(token);
  if (!vecino) return res.status(401).json({ message: "No autorizado" });

  const { telefono, direccion, email, genero, fotoPerfil } = req.body;

  if (telefono !== undefined) vecino.telefono = telefono;
  if (direccion !== undefined) vecino.direccion = direccion;
  if (email !== undefined) vecino.email = email;
  if (genero !== undefined) vecino.genero = genero;
  if (fotoPerfil !== undefined) vecino.fotoPerfil = fotoPerfil;

  vecino.name = `${vecino.nombre} ${vecino.apellidoPaterno} ${vecino.apellidoMaterno}`;
  saveVecinos();
  authSessions[token].user = vecino;

  res.json({ message: "Perfil actualizado", user: vecino });
});

app.delete("/api/auth/account", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  const vecino = findVecinoByToken(token);
  if (!vecino) return res.status(401).json({ message: "No autorizado" });

  const idx = registeredVecinos.indexOf(vecino);
  if (idx !== -1) registeredVecinos.splice(idx, 1);

  delete authSessions[token];
  saveVecinos();

  res.json({ message: "Cuenta eliminada permanentemente" });
});

loadVecinos();

app.listen(port, () => {
  console.log(`SIGIF backend running at http://localhost:${port}`);
});
