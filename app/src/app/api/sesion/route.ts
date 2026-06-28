import { NextRequest, NextResponse } from "next/server";
import { obtenerSesionActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

function generarSalaJitsi(): string {
  // Sala aleatoria de 12 caracteres alfanuméricos
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

export async function POST(req: NextRequest) {
  const psicologoId = await obtenerSesionActual();
  if (!psicologoId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { solicitudId, tipo } = await req.json();
  if (!solicitudId) {
    return NextResponse.json({ error: "solicitudId requerido" }, { status: 400 });
  }

  const solicitud = await prisma.solicitudAyuda.findUnique({
    where: { id: solicitudId },
  });
  if (!solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  const tipoSesion = tipo ?? solicitud.contactoPreferido;

  // Bloqueo atómico: solo el primero que ejecute esto gana
  let sesion;
  try {
    sesion = await prisma.$transaction(async (tx) => {
      // Actualizar SOLO si sigue en "esperando" — si ya fue tomada, count=0
      const tomada = await tx.solicitudAyuda.updateMany({
        where: { id: solicitudId, estadoSolicitud: "esperando" },
        data: { estadoSolicitud: "en_sesion", psicologoId },
      });
      if (tomada.count === 0) {
        throw new Error("ALREADY_TAKEN");
      }

      const nuevaSesion = await tx.sesion.create({
        data: {
          tipo: tipoSesion,
          salaJitsi: tipoSesion === "video" ? generarSalaJitsi() : null,
          iniciadoEn: new Date(),
          solicitudId,
          psicologoId,
        },
      });

      await tx.psicologo.update({
        where: { id: psicologoId },
        data: { estadoActual: "en_sesion", ultimaActividad: new Date() },
      });

      return nuevaSesion;
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "ALREADY_TAKEN") {
      return NextResponse.json({ error: "Esta solicitud ya fue tomada por otro psicólogo" }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ id: sesion.id }, { status: 201 });
}
