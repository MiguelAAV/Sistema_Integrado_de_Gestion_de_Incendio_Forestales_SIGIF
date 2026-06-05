# SIGIF — Sistema Integrado de Gestion de Incendios Forestales

**MVP web local** para la Municipalidad del Valle del Sol (Chile).

## Contexto

El municipio enfrenta incendios forestales con un tiempo de detección promedio de **35 minutos** y un objetivo de **menos de 5 minutos**. SIGIF busca reducir ese tiempo mediante reportes ciudadanos + integración con APIs externas (Bomberos, SENAPRED) + coordinación de brigadas en terreno.

Este repositorio contiene el MVP web local con datos mock para validar el flujo antes de un despliegue productivo.

## Usuarios del MVP

| Rol | Actor | Acceso |
|-----|-------|--------|
| Alcalde | Joaquin Rivas | Dashboard ejecutivo y reportes |
| Directora Gestion de Riesgos | Carolina Cisternas | Mapa GIS, alertas y coordinacion |
| Director de Tecnologia | Patricio Castillo | Configuracion e integraciones |
| Brigada municipal (2 equipos) | Brigada Norte, Brigada Sur | Focos asignados, estado y posicion |
| Ciudadano | Vecinos de la comuna | Reporte ciudadano y alertas |
| Operador municipal | Operador Central SIGIF | Validacion de reportes y despacho |
| Institucion externa | Bomberos | API mock de incidentes y recursos |
| Organismo regulador | SENAPRED | API mock de alertas y estado regional |

## Estructura del monorepo

```
.
├── backend/              # API Express con datos mock
│   └── src/
│       ├── server.js     # Endpoints REST
│       └── mockData.js   # Datos de prueba (10+ registros)
├── frontend/             # SPA con Vite + React
│   └── src/
│       ├── main.jsx      # Componente principal
│       └── styles.css    # Estilos
├── package.json          # Workspaces npm
└── README.md
```

## Requisitos

- Node.js >= 18
- pnpm >= 8 (instalar con `npm install -g pnpm`)

## Comandos

```bash
# Instalar dependencias
pnpm install

# Iniciar backend (http://localhost:4000) y frontend (http://localhost:5173)
pnpm dev

# Solo backend
pnpm dev:backend

# Solo frontend
pnpm dev:frontend

# Build produccion
pnpm build
```

## APIs disponibles

### Propias del sistema
- `GET /api/health` — Estado del servicio
- `GET /api/summary` — Dashboard con KPIs
- `GET /api/users` — Usuarios del sistema
- `GET /api/reports` — Reportes de focos
- `POST /api/reports` — Crear reporte ciudadano
- `GET /api/brigades` — Brigadas y ubicacion
- `GET /api/alerts` — Alertas emitidas
- `GET /api/risk-zones` — Zonas de riesgo

### APIs externas (mock)
- `GET /api/mock/senapred/events` — Eventos SENAPRED simulados
- `GET /api/mock/senapred/status` — Estado regional
- `GET /api/mock/bomberos/incidents` — Incidentes Bomberos simulados
- `GET /api/mock/bomberos/resources` — Recursos operativos

## Reglas del MVP local

1. **Sin despliegue** — solo entorno de desarrollo local
2. **Sin base de datos** — datos iniciales en memoria y reportes nuevos se pierden al reiniciar
3. **Sin autenticacion real** — los roles y usuarios existen en el mock para maquetar la navegacion
4. **APIs externas simuladas** — las integraciones con Bomberos y SENAPRED devuelven datos de ejemplo
5. **Sin aplicacion movil** — MVP exclusivamente web para escritorio + responsive
6. **Alcance funcional** — RF-01 (reporte ciudadano), RF-02 (mapa GIS de focos y brigadas), RF-03 (alertas), RF-04 (APIs mock), RF-05 (coordinacion de brigadas)

## Gitflow

- `develop` — rama de integracion
- `feature/*` — ramas para funcionalidades nuevas
