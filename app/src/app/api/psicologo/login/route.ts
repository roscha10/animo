import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { crearToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const psicologo = await prisma.psicologo.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!psicologo) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const valido = await compare(password, psicologo.password);
    if (!valido) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // Actualizar estado y última actividad
    await prisma.psicologo.update({
      where: { id: psicologo.id },
      data: { estadoActual: "disponible", ultimaActividad: new Date() },
    });

    const token = await crearToken(psicologo.id);
    const res = NextResponse.json({ id: psicologo.id });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[POST /api/psicologo/login]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
