# Ánimo v2

Reescritura de la plataforma Ánimo con **FastAPI** (Python) en el backend y **React + Vite** en el frontend.

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | FastAPI + SQLAlchemy + PostgreSQL 16 |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Auth | JWT en cookie httpOnly (passlib + python-jose) |
| Video | Jitsi Meet embebido |
| Email | Resend API |
| Contenedores | Docker + Docker Compose |

---

## Estructura

```
AnimoV2/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py               # App FastAPI + endpoint /geoip
│       ├── models.py             # Modelos: Psicologo, SolicitudAyuda, Sesion
│       ├── database.py
│       ├── core/
│       │   ├── config.py         # Variables de entorno
│       │   └── security.py       # Hash, JWT, dependencia auth
│       ├── routers/
│       │   ├── auth.py           # Registro, login, logout, /me
│       │   ├── solicitud.py      # Crear solicitud, pendientes, aceptar
│       │   ├── sesion.py         # Ver sesión, terminar sesión
│       │   └── psicologo.py      # Cambiar estado disponibilidad
│       ├── schemas/
│       │   ├── psicologo.py
│       │   └── solicitud.py
│       └── services/
│           └── email.py          # Notificaciones Resend
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                # Proxy /api/ → backend:8000
    └── src/
        ├── pages/
        │   ├── Home.tsx
        │   ├── NecesitoAyuda.tsx  # Formulario 3 pasos + geolocalización IP
        │   ├── Gracias.tsx        # Sala de espera del paciente
        │   ├── PsicologoLogin.tsx
        │   ├── PsicologoRegistro.tsx  # Registro con especialidades multi-select
        │   ├── Dashboard.tsx      # Dashboard psicólogo (polling 3s)
        │   └── Sesion.tsx         # Sala Jitsi
        └── lib/
            └── api.ts             # Cliente HTTP centralizado
```

---

## Setup local

### Requisitos
- Docker Desktop corriendo

### Pasos

**1. Crear `.env`** en la carpeta `AnimoV2/`:

```env
POSTGRES_PASSWORD=local1234
JWT_SECRET=supersecretolocalparadesarrollo123456
RESEND_API_KEY=
APP_URL=http://localhost:3000
```

**2. Levantar todo:**

```bash
docker-compose up --build
```

La primera vez tarda unos minutos. Una vez listo:

- **App:** http://localhost:3000
- **API docs (Swagger):** http://localhost:8001/docs

> Si el puerto 8000 está ocupado por otro proyecto, el backend se expone en `8001` (configurado en docker-compose.yml).

**3. Para detener:**

```bash
Ctrl + C
docker-compose down
```

**Si cambiaste el modelo de base de datos**, recrea los volúmenes:

```bash
docker-compose down -v
docker-compose up --build
```

---

## Flujo de la aplicación

### Paciente
1. Entra a `/necesito-ayuda` → formulario 3 pasos
2. Paso 1: síntomas + nivel de crisis (alerta 171 si hay ideación suicida)
3. Paso 2: datos opcionales — ciudad y estado se pre-rellenan por IP automáticamente
4. Paso 3: preferencia de contacto (video / llamada / chat)
5. Se redirige a `/gracias?id=...` donde espera con polling cada 4s
6. Cuando un psicólogo acepta → auto-redirige a `/sesion/:id`

### Psicólogo
1. Registro en `/psicologo/registro` — con especialidades múltiples, bio y teléfono
2. Login en `/psicologo/login`
3. Dashboard: lista de solicitudes ordenadas por **emergencia → nivel de crisis → tiempo de espera**
4. Al aceptar → crea sesión con sala Jitsi aleatoria
5. Al terminar → puede agregar notas clínicas, vuelve a estado disponible

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `POSTGRES_PASSWORD` | Contraseña de la base de datos |
| `JWT_SECRET` | Clave para firmar tokens JWT |
| `RESEND_API_KEY` | API key de Resend para emails (opcional en dev) |
| `APP_URL` | URL pública de la app (para CORS) |

---

## API endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro` | Registro de psicólogo |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Datos del psicólogo autenticado |
| POST | `/solicitud` | Crear solicitud de ayuda (paciente) |
| GET | `/solicitud/pendientes` | Listar solicitudes en espera (psicólogo) |
| GET | `/solicitud/:id/estado` | Estado de una solicitud (polling) |
| POST | `/solicitud/:id/aceptar` | Aceptar solicitud (psicólogo) |
| GET | `/sesion/:id` | Datos de la sesión |
| PUT | `/sesion/:id/terminar` | Terminar sesión |
| PUT | `/psicologo/estado` | Cambiar disponibilidad |
| GET | `/geoip` | Detectar ciudad/estado por IP |
| GET | `/health` | Health check |

---

## Diferencias con v1

| Feature | v1 (Next.js) | v2 (FastAPI) |
|---|---|---|
| Especialidades | Multi-select | Multi-select |
| Bio y teléfono del psicólogo | Sí | Sí |
| Número federación FPV | Sí | Sí |
| Geolocalización por IP | Sí | Sí |
| Prioridad de solicitudes | emergencia → crisis → espera | emergencia → crisis → espera |
| Backend separado | No (API Routes Next.js) | Sí (FastAPI independiente) |
