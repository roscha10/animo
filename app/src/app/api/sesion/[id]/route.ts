import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerSesionActual } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const psicologoIdAutenticado = await obtenerSesionActual();

  const sesion = await prisma.sesion.findUnique({
    where: { id },
    select: {
      id: true,
      tipo: true,
      salaJitsi: true,
      iniciadoEn: true,
      completadoEn: true,
      psicologoId: true,
      solicitud: {
        select: {
          nombreAnonimo: true,
          sintomas: true,
          descripcion: true,
          nivelCrisis: true,
          esEmergencia: true,
        },
      },
      psicologo: {
        select: { nombre: true },
      },
    },
  });

  if (!sesion) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    ...sesion,
    miRol: psicologoIdAutenticado === sesion.psicologoId ? "psicologo" : "paciente",
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const psicologoId = await obtenerSesionActual();
  if (!psicologoId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const { notas } = await req.json();

  await prisma.$transaction(async (tx) => {
    const sesion = await tx.sesion.update({
      where: { id, psicologoId },
      data: { completadoEn: new Date(), notas: notas || null },
    });

    await tx.solicitudAyuda.update({
      where: { id: sesion.solicitudId },
      data: { estadoSolicitud: "completada" },
    });

    await tx.psicologo.update({
      where: { id: psicologoId },
      data: {
        estadoActual: "disponible",
        totalSesiones: { increment: 1 },
        ultimaActividad: new Date(),
      },
    });
  });

  return NextResponse.json({ ok: true });
}
