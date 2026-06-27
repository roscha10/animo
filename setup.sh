#!/bin/bash
# =============================================================================
# setup.sh — Script de instalación de Ánimo en el VPS
# Ejecutar como root en Ubuntu 24.04
# =============================================================================

set -e

DOMINIO="${DOMINIO:-animo.kaimindconsulting.com}"
EMAIL="${EMAIL:-admin@kaimindconsulting.com}"
RUTA="/opt/animo"

echo ""
echo "======================================================"
echo "  ÁNIMO — Setup del servidor"
echo "  Dominio: $DOMINIO"
echo "======================================================"
echo ""

# ——— 1. Copiar archivos del proyecto ———
echo "[1/6] Preparando directorio del proyecto..."
mkdir -p "$RUTA"
cp -r . "$RUTA/"
cd "$RUTA"

# ——— 2. Crear archivo .env ———
echo "[2/6] Configurando variables de entorno..."
if [ ! -f .env ]; then
  DB_PASSWORD=$(openssl rand -hex 24)
  JWT_SECRET=$(openssl rand -hex 32)
  cat > .env <<EOF
DOMAIN=$DOMINIO
ADMIN_EMAIL=$EMAIL
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
EOF
  echo "  .env creado con credenciales seguras generadas automáticamente."
else
  echo "  .env ya existe, conservando."
fi

# ——— 3. Usar nginx sin SSL para obtener certificado ———
echo "[3/6] Iniciando nginx sin SSL (para obtener certificado)..."
cp nginx/nginx-inicial.conf nginx/nginx.conf
docker compose up -d nginx app postgres

echo "  Esperando que los servicios arranquen..."
sleep 10

# ——— 4. Obtener certificado SSL ———
echo "[4/6] Obteniendo certificado SSL Let's Encrypt para $DOMINIO..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMINIO"

# ——— 5. Activar nginx con SSL ———
echo "[5/6] Activando configuración HTTPS..."
# Actualizar dominio en el nginx.conf de producción
sed -i "s/animo\.kaimindconsulting\.com/$DOMINIO/g" nginx/nginx.conf
docker compose down nginx
docker compose up -d

# ——— 6. Migraciones de base de datos ———
echo "[6/6] Aplicando esquema de base de datos..."
sleep 5
docker compose exec app npx prisma db push --accept-data-loss

echo ""
echo "======================================================"
echo "  ¡ÁNIMO está en línea!"
echo "  URL: https://$DOMINIO"
echo "======================================================"
echo ""
echo "  Comandos útiles:"
echo "  Ver logs:    docker compose logs -f app"
echo "  Reiniciar:   docker compose restart app"
echo "  Actualizar:  git pull && docker compose up -d --build app"
echo ""
