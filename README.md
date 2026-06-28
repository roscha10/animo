# Ánimo — Plataforma de Apoyo en Salud Mental

**Ánimo** es una iniciativa sin fines de lucro de la alianza **Kaimind × Vikua** para conectar a personas en Venezuela que necesitan apoyo emocional con psicólogos venezolanos voluntarios, certificados y disponibles en tiempo real.

- 100% gratuito
- Sin registro previo para pacientes
- Videollamada, llamada o chat (Jitsi Meet)
- Protocolo de emergencia ante ideación suicida (línea 171)

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend + API | Next.js 15 (App Router), TypeScript |
| Base de datos | PostgreSQL 16 vía Prisma ORM |
| Estilos | Tailwind CSS con paleta personalizada |
| Auth psicólogo | JWT con jose + bcryptjs, cookie httpOnly |
| Video/Llamada | Jitsi Meet (meet.jit.si, sin servidor propio) |
| Geolocalización | ip-api.com (detección automática por IP) |
| Contenedores | Docker + Docker Compose |
| Reverse proxy | Caddy (en el VPS) |

---

## Arquitectura de la app

```
/
├── docker-compose.yml          # Orquestación: app + postgres + certbot
├── .env                        # Variables de entorno (NO subir a git)
└── app/
    ├── Dockerfile              # Build multi-stage (slim, con OpenSSL)
    ├── prisma/
    │   └── schema.prisma       # Modelos: SolicitudAyuda, Psicologo, Sesion
    └── src/app/
        ├── page.tsx                        # Landing page
        ├── necesito-ayuda/page.tsx         # Formulario 3 pasos (paciente)
        ├── esperando/[id]/page.tsx         # Sala de espera del paciente
        ├── sesion/[id]/page.tsx            # Sala Jitsi (paciente + psicólogo)
        ├── psicologo/
        │   ├── page.tsx                    # Login psicólogo
        │   ├── registro/page.tsx           # Registro psicólogo
        │   └── dashboard/page.tsx          # Dashboard en tiempo real
        └── api/
            ├── solicitud/route.ts          # POST nueva solicitud de ayuda
            ├── solicitud/[id]/route.ts     # GET estado de solicitud
            ├── sesion/route.ts             # POST crear sesión (psicólogo acepta)
            ├── sesion/[id]/route.ts        # GET datos de sesión
            └── psicologo/
                ├── login/route.ts
                ├── logout/route.ts
                ├── registro/route.ts
                ├── estado/route.ts         # PUT cambiar disponibilidad
                ├── solicitudes/route.ts    # GET lista de pendientes
                └── yo/route.ts             # GET datos del psicólogo logueado
```

### Flujo del paciente
1. Entra a `/necesito-ayuda` → formulario de 3 pasos (ubicación, síntomas, contacto preferido)
2. Si marca ideación suicida → protocolo de emergencia + teléfono 171
3. Se crea `SolicitudAyuda` en BD → redirige a `/esperando/[id]`
4. La sala de espera hace polling cada 5s hasta que un psicólogo acepte
5. Al ser aceptada → redirige a `/sesion/[id]` con Jitsi embebido

### Flujo del psicólogo
1. Login en `/psicologo` → JWT en cookie httpOnly
2. Dashboard en `/psicologo/dashboard` con estado (Disponible / En espera / No disponible)
3. Lista de solicitudes pendientes ordenadas por: emergencia → nivel de crisis → tiempo de espera
4. Al aceptar → crea `Sesion` con sala Jitsi aleatoria → redirige a `/sesion/[id]`

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (junto a `docker-compose.yml`):

```env
DB_PASSWORD=una_password_segura_aqui
JWT_SECRET=una_clave_jwt_larga_y_aleatoria_aqui
DOMAIN=animo.kaimindconsulting.com
```

Para generar el JWT_SECRET puedes usar:
```bash
openssl rand -base64 32
```

---

## Setup local (desarrollo)

### Requisitos
- Node.js 20+
- Docker Desktop
- PostgreSQL (vía Docker o local)

### Pasos

```bash
# 1. Clonar el repo
git clone https://github.com/kaimind/animo.git
cd animo

# 2. Levantar la base de datos local
docker run -d \
  --name animo-postgres \
  -e POSTGRES_DB=animodb \
  -e POSTGRES_USER=animo \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Configurar variables de entorno locales
cd app
cp .env.example .env.local
# Editar .env.local con:
# DATABASE_URL=postgresql://animo:dev_password@localhost:5432/animodb
# JWT_SECRET=cualquier_string_para_desarrollo

# 4. Instalar dependencias
npm install

# 5. Generar cliente Prisma
npx prisma generate

# 6. Crear tablas en la BD (ver sección "Base de datos" abajo)

# 7. Levantar en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Base de datos

> **Nota importante:** Prisma CLI v7 requiere `prisma.config.ts` y es incompatible con el setup actual. Las tablas se crean directamente con SQL.

### Crear las tablas (primera vez)

```sql
-- Ejecutar contra la base de datos animodb

CREATE TABLE IF NOT EXISTS "psicologos" (
    "id"              TEXT NOT NULL PRIMARY KEY,
    "creadoEn"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre"          TEXT NOT NULL,
    "email"           TEXT NOT NULL UNIQUE,
    "password"        TEXT NOT NULL,
    "telefono"        TEXT,
    "bio"             TEXT,
    "cedula"          TEXT NOT NULL UNIQUE,
    "numFederacion"   TEXT,
    "certificado"     BOOLEAN NOT NULL DEFAULT false,
    "especialidades"  TEXT[] NOT NULL DEFAULT '{}',
    "estadoActual"    TEXT NOT NULL DEFAULT 'offline',
    "ultimaActividad" TIMESTAMP(3),
    "totalSesiones"   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "solicitudes_ayuda" (
    "id"                TEXT NOT NULL PRIMARY KEY,
    "creadoEn"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombreAnonimo"     TEXT,
    "edad"              INTEGER,
    "ciudad"            TEXT,
    "estadoVe"          TEXT,
    "latitud"           DOUBLE PRECISION,
    "longitud"          DOUBLE PRECISION,
    "sintomas"          TEXT[] NOT NULL DEFAULT '{}',
    "descripcion"       TEXT,
    "nivelCrisis"       INTEGER NOT NULL,
    "esEmergencia"      BOOLEAN NOT NULL DEFAULT false,
    "contactoPreferido" TEXT NOT NULL,
    "estadoSolicitud"   TEXT NOT NULL DEFAULT 'esperando',
    "psicologoId"       TEXT REFERENCES "psicologos"("id")
);

CREATE TABLE IF NOT EXISTS "sesiones" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "creadoEn"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo"         TEXT NOT NULL,
    "salaJitsi"    TEXT,
    "iniciadoEn"   TIMESTAMP(3),
    "completadoEn" TIMESTAMP(3),
    "notas"        TEXT,
    "solicitudId"  TEXT NOT NULL UNIQUE REFERENCES "solicitudes_ayuda"("id"),
    "psicologoId"  TEXT NOT NULL REFERENCES "psicologos"("id")
);
```

### En el VPS (Docker)

```bash
docker compose exec -T postgres psql -U animo -d animodb << 'SQL'
-- pegar el SQL de arriba
SQL
```

---

## Despliegue en producción (VPS)

### Infraestructura
- **VPS:** Ubuntu 24.04, Docker 29.5+
- **Reverse proxy:** Caddy (ya instalado, sirve otros sitios de Kaimind)
- **Dominio:** `animo.kaimindconsulting.com` → IP del VPS

### Primera vez en el VPS

```bash
# 1. Clonar el repo
git clone https://github.com/kaimind/animo.git /opt/animo
cd /opt/animo

# 2. Crear .env
nano .env
# Pegar las variables (ver sección "Variables de entorno")

# 3. Actualizar docker-compose.yml: asegurarse que el port del app sea:
#    "0.0.0.0:3000:3000"

# 4. Levantar contenedores
docker compose up -d --build

# 5. Crear las tablas (SQL de la sección anterior)
docker compose exec -T postgres psql -U animo -d animodb << 'SQL'
-- pegar SQL aquí
SQL
```

### Caddy (reverse proxy)

Editar `/etc/caddy/Caddyfile` y agregar:

```
animo.kaimindconsulting.com {
    reverse_proxy localhost:3000
}
```

Luego:
```bash
systemctl reload caddy
```

Caddy gestiona el SSL automáticamente (Let's Encrypt).

### Actualizar la app (flujo normal del equipo)

Cada vez que haya cambios en el repo, así se despliega en producción:

```bash
# 1. Conectarse al VPS
ssh root@213.199.58.110

# 2. Ir al directorio del proyecto
cd /opt/animo

# 3. Bajar los últimos cambios del repo
git pull

# 4. Reconstruir y reiniciar solo el contenedor de la app
docker compose up -d --build app
```

El build tarda ~2 minutos. La base de datos y sus datos **no se tocan** en este proceso.

> **Tip:** Si solo cambiaron archivos de la carpeta `app/public/` (imágenes, etc.) no hace falta rebuild — puedes copiar los archivos directamente:
> ```bash
> # Desde tu PC (PowerShell)
> scp -r app/public/ root@213.199.58.110:/opt/animo/app/
> docker compose restart app
> ```

### Ver logs en producción

```bash
# Logs en tiempo real
docker compose logs -f app

# Últimas 50 líneas
docker compose logs app --tail=50

# Ver estado de los contenedores
docker compose ps
```

---

## Logos y branding

Los logos se encuentran en `app/public/logos/`:
- `kaimind.png` — Logo Kaimind versión negativa (blanca, para fondo oscuro)
- `vikua.png` — Logo Vikua color

**Paleta de colores** (definida en `tailwind.config.ts`):
- `animo` — Teal primario (une el verde Kaimind con el azul Vikua)
- `kaimind` — Verde `#26D07C` (estados disponible/éxito)
- `vikua.blue` — Azul `#38BEFC`, `vikua.orange`, `vikua.lime`, `vikua.dark`

---

## Próximos pasos / Roadmap

- [ ] Notificaciones WhatsApp/email cuando llega una solicitud nueva
- [ ] Panel de administración para verificar credenciales de psicólogos
- [ ] Integración con la Federación de Psicólogos de Venezuela
- [ ] Dominio `animo.vikua.com` cuando se formalice la alianza
- [ ] Chat en tiempo real (WebSockets o polling) para modalidad "chat"
- [ ] Estadísticas y reportes de sesiones
- [ ] App móvil (PWA)

---

## Seguridad

- Los pacientes no se registran — solo dejan datos opcionales (nombre, edad)
- Las contraseñas de psicólogos se almacenan con bcrypt (factor 12)
- JWT en cookies `httpOnly`, `secure`, `sameSite=strict`
- Los datos de sesión son confidenciales y solo visibles para el psicólogo

---

## Equipo

Iniciativa sin fines de lucro desarrollada por:

- **Kaimind** — Data Insight_ (kaimindconsulting.com)
- **Vikua** — Conocimiento para acertar (vikua.com)

En alianza con la **Federación de Psicólogos de Venezuela**.
