import { NextRequest, NextResponse } from "next/server";
import { obtenerSesionActual } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ESTADOS_VALIDOS = ["disponible", "en_sesion", "en_espera", "no_disponible", "offline"];

export async function PUT(req: NextRequest) {
  const psicologoId = await obtenerSesionActual();
  if (!psicologoId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { estado } = await req.json();
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  await prisma.psicologo.update({
    where: { id: psicologoId },
    data: { estadoActual: estado, ultimaActividad: new Date() },
  });

  return NextResponse.json({ ok: true });
}
