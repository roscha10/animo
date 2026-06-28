import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Llamada por cron job nocturno con la clave del .env
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-key");
  if (!auth || auth !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const hace30dias = new Date();
  hace30dias.setDate(hace30dias.getDate() - 30);

  // Anonimizar solicitudes completadas/canceladas con más de 30 días
  // No se borran — se reemplaza la info personal por nulos
  const anonimizadas = await prisma.solicitudAyuda.updateMany({
    where: {
      estadoSolicitud: { in: ["completada", "cancelada"] },
      creadoEn: { lt: hace30dias },
      nombreAnonimo: { not: null },
    },
    data: {
      nombreAnonimo: null,
      edad: null,
      ciudad: null,
      estadoVe: null,
      latitud: null,
      longitud: null,
      descripcion: null,
    },
  });

  // Borrar sesiones huérfanas (sin solicitud asociada) mayores de 30 días
  const sesionesViejas = await prisma.sesion.deleteMany({
    where: {
      creadoEn: { lt: hace30dias },
      completadoEn: { not: null },
    },
  });

  return NextResponse.json({
    ok: true,
    anonimizadas: anonimizadas.count,
    sesionesEliminadas: sesionesViejas.count,
    fecha: new Date().toISOString(),
  });
}
