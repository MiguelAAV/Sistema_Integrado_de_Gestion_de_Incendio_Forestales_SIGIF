# SIGIF — Sistema Integrado de Gestion de Incendios Forestales

**MVP web local** para la Municipalidad del Valle del Sol (Chile).

## Contexto

El municipio enfrenta incendios forestales con un tiempo de detección promedio de **35 minutos** y un objetivo de **menos de 5 minutos**. SIGIF busca reducir ese tiempo mediante reportes ciudadanos + integración con APIs externas (Bomberos, SENAPRED) + coordinación de brigadas en terreno.

Este repositorio contiene el MVP web local con datos mock para validar el flujo antes de un despliegue productivo.

## Funcionalidades implementadas

- **Roles hibridos**: Vecino puede registrarse como Vecino, Vecino Bombero o Vecino Funcionario — cada uno ve paneles adicionales en su dashboard.
- **Reportes mejorados**: formulario con descripcion, region/comuna, checklist de condiciones (viento, viviendas, atrapados, etc.), subida multiple de fotos con previsualizacion, y tipo "Quema agricola".
- **Notificaciones en vivo**: barra de notificaciones que muestra nuevos reportes en tiempo real con auto-refresh cada 15s.
- **Seguimiento de reportes**: al hacer clic en un reporte en la tabla, se despliega una linea de tiempo con el estado de cada etapa (reportado, en verificacion, brigada asignada, en atencion, controlado).
- **Mapa GIS**: visualizacion de focos (marcadores rojos) y puntos de evacuacion (verdes) con Leaflet y circulos de calor.
- **Boton de emergencia**: genera alerta CRITICA inmediata con un solo clic (con confirmacion).
- **Perfil de vecino**: edicion de telefono, direccion, email, genero y foto; eliminacion de cuenta con doble confirmacion.
- **Autenticacion**: login con pestanas Funcionario/Vecino, registro de vecinos con terminos y condiciones, sesiones en memoria + token en sessionStorage.
- **Paginas estaticas**: Quienes Somos y Contacto con enlaces en Header y Footer.
- **APIs mock**: integraciones simuladas con SENAPRED (estado regional, eventos) y Bomberos (recursos, incidentes activos).
- **Diseño limpio**: fondo suave, tarjetas sin bordes, tipografia Playfair Display + Inter, paleta de colores reducida con variables CSS.

## Usuarios del MVP

### Funcionarios (login con correo y contraseña)

| Rol | Email | Pass | Acceso |
|-----|-------|------|--------|
| Alcalde | j.rivas@municipalidad.cl | admin123 | Dashboard ejecutivo y reportes |
| Directora Gestion de Riesgos | c.cisternas@municipalidad.cl | admin123 | Mapa GIS, alertas y coordinacion |
| Director de Tecnologia | p.castillo@municipalidad.cl | admin123 | Configuracion e integraciones |
| Brigada Norte | brigada.norte@municipalidad.cl | brigada123 | Focos asignados, estado y posicion |
| Brigada Sur | brigada.sur@municipalidad.cl | brigada123 | Focos asignados, estado y posicion |
| Operador Central | operador@municipalidad.cl | operador123 | Validacion de reportes y despacho |

### Vecinos (login con RUT y contraseña)

| Nombre | RUT | Pass | Notas |
|--------|-----|------|-------|
| Maria Lopez Diaz | 22222222-2 | mimaria123 | Vecino regular |

Los vecinos pueden **registrarse** en `/register` seleccionando un rol: Vecino, Vecino Bombero (ve recursos de bomberos y brigadas) o Vecino Funcionario (ve supervisión municipal completa).

## Estructura del monorepo

```
.
├── backend/
│   ├── gateway/                 # Proxy (puerto 4000)
│   │   └── src/server.js        # Rutas a microservicios via fetch
│   ├── auth/                    # Microservicio de autenticacion (4001)
│   │   └── src/server.js        # Login, register, profile, delete, sesiones
│   ├── incidents/               # Microservicio de reportes (4002)
│   │   └── src/server.js        # CRUD de focos de incendio
│   ├── operations/              # Microservicio operativo (4003)
│   │   └── src/server.js        # Brigadas, alertas, zonas riesgo, evacuacion
│   └── integrations/            # Microservicio de integraciones (4004)
│       └── src/server.js        # Mock SENAPRED y Bomberos
├── frontend/
│   └── src/
│       ├── main.jsx             # Entry point con routing
│       ├── styles.css           # Sistema de estilos con variables CSS
│       ├── context/
│       │   └── AuthContext.jsx  # Contexto de autenticacion
│       ├── components/
│       │   ├── Header.jsx       # Navbar con logo, enlaces y usuario
│       │   └── Footer.jsx       # Grid 4 columnas + numeros emergencia
│       └── pages/
│           ├── Login.jsx        # Login con tabs Funcionario/Vecino
│           ├── Register.jsx     # Registro con terminos y formulario
│           ├── Dashboard.jsx    # Enrutador de dashboard segun rol
│           ├── VecinoDashboard.jsx  # Dashboard vecino con reportes, mapa, tracking
│           ├── FuncionarioDashboard.jsx  # Dashboard funcionario completo
│           ├── Profile.jsx      # Edicion de perfil y eliminacion
│           ├── QuienesSomos.jsx # Pagina institucional
│           └── Contacto.jsx     # Pagina de contacto
├── package.json                 # Workspaces pnpm con scripts
└── README.md
```

## Requisitos

- Node.js >= 18
- pnpm >= 8 (instalar con `npm install -g pnpm`)

## Comandos

```bash
# Instalar dependencias
pnpm install

# Iniciar frontend + todos los microservicios
pnpm dev

# Solo frontend (http://localhost:5173)
pnpm dev:frontend

# Build produccion
pnpm build
```

### Iniciar servicios individualmente

```bash
pnpm dev:gateway      # http://localhost:4000
pnpm dev:auth         # http://localhost:4001
pnpm dev:incidents    # http://localhost:4002
pnpm dev:operations   # http://localhost:4003
pnpm dev:integrations # http://localhost:4004
```

## APIs disponibles

### Autenticacion (via gateway en /api/auth/*)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/auth/login | Login (Funcionario o Vecino) |
| POST | /api/auth/register | Registro de vecino |
| GET | /api/auth/me | Perfil del usuario autenticado |
| PUT | /api/auth/profile | Actualizar perfil |
| DELETE | /api/auth/account | Eliminar cuenta |

### Reportes (via gateway en /api/reports/*)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/reports | Todos los reportes |
| POST | /api/reports | Crear reporte (sector, type, severity, lat, lng, descripcion, checklist[], fotos[], region, comuna, direccion) |

### Operaciones (via gateway en /api/*)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/summary | KPIs del dashboard |
| GET | /api/users | Usuarios del sistema |
| GET | /api/brigades | Brigadas y ubicacion |
| GET | /api/alerts | Alertas emitidas |
| GET | /api/risk-zones | Zonas de riesgo |
| GET | /api/evacuation-points | Puntos de evacuacion |

### Integraciones mock (via gateway en /api/mock/*)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/mock/senapred/status | Estado regional SENAPRED |
| GET | /api/mock/senapred/events | Eventos activos SENAPRED |
| GET | /api/mock/bomberos/resources | Recursos operativos Bomberos |
| GET | /api/mock/bomberos/incidents | Incidentes Bomberos |

## Reglas del MVP local

1. **Sin despliegue** — solo entorno de desarrollo local
2. **Persistencia de vecinos** — los vecinos registrados se guardan en `backend/auth/vecinos_registrados.json`; los reportes nuevos se pierden al reiniciar
3. **Tokens en memoria** — las sesiones expiran al reiniciar el servidor de auth
4. **APIs externas simuladas** — las integraciones con Bomberos y SENAPRED devuelven datos de ejemplo
5. **Sin aplicacion movil** — MVP exclusivamente web para escritorio + responsivo
6. **Sin base de datos** — datos iniciales mock en cada microservicio

## Gitflow

- `develop` — rama de integracion
- `feature/*` — ramas para funcionalidades nuevas
