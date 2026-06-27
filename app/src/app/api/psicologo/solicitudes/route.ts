import { NextResponse } from "next/server";
import { obtenerSesionActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const psicologoId = await obtenerSesionActual();
  if (!psicologoId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Solicitudes en espera: sin psicólogo asignado o asignadas a este psicólogo
  const solicitudes = await prisma.solicitudAyuda.findMany({
    where: {
      estadoSolicitud: "esperando",
      psicologoId: null,
    },
    orderBy: [
      { esEmergencia: "desc" },  // emergencias primero
      { nivelCrisis: "desc" },   // luego por nivel de crisis
      { creadoEn: "asc" },       // luego por orden de llegada
    ],
    select: {
      id: true,
      creadoEn: true,
      nombreAnonimo: true,
      edad: true,
      ciudad: true,
      estadoVe: true,
      sintomas: true,
      descripcion: true,
      nivelCrisis: true,
      esEmergencia: true,
      contactoPreferido: true,
      estadoSolicitud: true,
    },
  });

  return NextResponse.json(solicitudes);
}
