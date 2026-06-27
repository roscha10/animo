import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { obtenerSesionActual } from "@/lib/auth";

export async function POST() {
  const psicologoId = await obtenerSesionActual();
  if (psicologoId) {
    await prisma.psicologo.update({
      where: { id: psicologoId },
      data: { estadoActual: "offline" },
    });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
