import { NextResponse } from "next/server";
import { obtenerSesionActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const psicologoId = await obtenerSesionActual();
  if (!psicologoId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const psicologo = await prisma.psicologo.findUnique({
    where: { id: psicologoId },
    select: { id: true, nombre: true, estadoActual: true, totalSesiones: true, especialidades: true },
  });

  if (!psicologo) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(psicologo);
}
