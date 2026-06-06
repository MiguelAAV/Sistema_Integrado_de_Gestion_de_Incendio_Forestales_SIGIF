import cors from "cors";
import express from "express";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VECINOS_FILE = join(__dirname, "..", "vecinos_registrados.json");

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

const mockCredentials = [
  { email: "j.rivas@municipalidad.cl", password: "admin123", userId: 1, role: "Funcionario" },
  { email: "c.cisternas@municipalidad.cl", password: "admin123", userId: 2, role: "Funcionario" },
  { email: "p.castillo@municipalidad.cl", password: "admin123", userId: 3, role: "Funcionario" },
  { email: "brigada.norte@municipalidad.cl", password: "brigada123", userId: 4, role: "Funcionario" },
  { email: "brigada.sur@municipalidad.cl", password: "brigada123", userId: 5, role: "Funcionario" },
  { email: "operador@municipalidad.cl", password: "operador123", userId: 8, role: "Funcionario" }
];

const defaultVecinos = [
  {
    id: 101, name: "Maria Lopez Diaz", role: "Vecino", area: "Comunidad",
    nombre: "Maria", apellidoPaterno: "Lopez", apellidoMaterno: "Diaz",
    rut: "22222222-2", telefono: "987654321", contrasena: "mimaria123",
    direccion: "Calle Los Olivos 456", fechaNacimiento: "1990-05-15",
    fotoPerfil: "", email: "maria.lopez@correo.cl", genero: "Femenino",
    lat: -35.01, lng: -71.27, acceptedTerms: true, tipoRol: "", registeredAt: "2026-01-15T10:00:00.000Z"
  }
];

const registeredVecinos = [];
const authSessions = {};

function loadVecinos() {
  if (existsSync(VECINOS_FILE)) {
    try {
      const data = JSON.parse(readFileSync(VECINOS_FILE, "utf-8"));
      registeredVecinos.push(...data);
      console.log(`Cargados ${data.length} vecinos registrados.`);
    } catch {
      console.log("Archivo corrupto, usando defaults.");
      registeredVecinos.push(...defaultVecinos);
    }
  } else {
    registeredVecinos.push(...defaultVecinos);
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
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;

  if (role === "Funcionario") {
    const cred = mockCredentials.find((c) => c.email === email && c.password === password);
    if (!cred) return res.status(401).json({ message: "Credenciales invalidas" });
    const user = users.find((u) => u.id === cred.userId);
    const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    authSessions[token] = { user, role: "Funcionario" };
    return res.json({ token, user });
  }

  if (role === "Vecino") {
    const vecino = registeredVecinos.find((v) => v.rut === email);
    if (!vecino) return res.status(401).json({ message: "Vecino no registrado. Crea una cuenta primero." });
    if (vecino.contrasena !== password) return res.status(401).json({ message: "Contrasena incorrecta" });
    const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const effectiveRole = vecino.tipoRol === "bombero" ? "VecinoBombero"
      : vecino.tipoRol === "funcionario" ? "VecinoFuncionario"
      : "Vecino";

    authSessions[token] = { user: vecino, role: effectiveRole };
    return res.json({ token, user: { ...vecino, role: effectiveRole } });
  }

  res.status(400).json({ message: "Rol invalido" });
});

app.post("/api/auth/register", (req, res) => {
  const { nombre, apellidoPaterno, apellidoMaterno, rut, telefono, contrasena, email, genero, direccion, fechaNacimiento, fotoPerfil, lat, lng, acceptedTerms, tipoRol } = req.body;

  if (!acceptedTerms) return res.status(400).json({ message: "Debe aceptar los terminos y condiciones" });
  if (!nombre || !apellidoPaterno || !apellidoMaterno || !rut || !telefono || !contrasena)
    return res.status(400).json({ message: "Nombre, apellidos, RUT, telefono y contrasena son obligatorios" });

  if (registeredVecinos.find((v) => v.rut === rut))
    return res.status(409).json({ message: "RUT ya registrado" });

  const effectiveRole = tipoRol === "bombero" ? "VecinoBombero"
    : tipoRol === "funcionario" ? "VecinoFuncionario"
    : "Vecino";

  const newVecino = {
    id: registeredVecinos.length + 100,
    name: `${nombre} ${apellidoPaterno} ${apellidoMaterno}`,
    role: effectiveRole, area: "Comunidad",
    nombre, apellidoPaterno, apellidoMaterno, rut, telefono, contrasena,
    email: email || "", genero: genero || "", direccion: direccion || "",
    fechaNacimiento: fechaNacimiento || "", fotoPerfil: fotoPerfil || "",
    lat: lat || null, lng: lng || null,
    tipoRol: tipoRol || "",
    acceptedTerms: true, registeredAt: new Date().toISOString()
  };

  registeredVecinos.push(newVecino);
  saveVecinos();
  const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  authSessions[token] = { user: newVecino, role: newVecino.role };
  res.status(201).json({ token, user: newVecino });
});

app.get("/api/auth/me", (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token || !authSessions[token]) return res.status(401).json({ message: "No autenticado" });
  res.json(authSessions[token]);
});

function findVecinoByToken(token) {
  const session = authSessions[token];
  if (!session || session.role !== "Vecino") return null;
  return registeredVecinos.find((v) => v.id === session.user.id);
}

app.put("/api/auth/profile", (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
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
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const vecino = findVecinoByToken(token);
  if (!vecino) return res.status(401).json({ message: "No autorizado" });

  registeredVecinos.splice(registeredVecinos.indexOf(vecino), 1);
  delete authSessions[token];
  saveVecinos();
  res.json({ message: "Cuenta eliminada permanentemente" });
});

loadVecinos();

app.listen(port, () => {
  console.log(`[auth] running at http://localhost:${port}`);
});
