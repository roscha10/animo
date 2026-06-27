import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { crearToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, email, password, telefono, cedula, numFederacion, bio, especialidades } = body;

    if (!nombre || !email || !password || !cedula) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }
    if (!especialidades?.length) {
      return NextResponse.json({ error: "Selecciona al menos una especialidad" }, { status: 400 });
    }

    const existe = await prisma.psicologo.findFirst({
      where: { OR: [{ email }, { cedula }] },
    });
    if (existe) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email o cédula" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);
    const psicologo = await prisma.psicologo.create({
      data: {
        nombre,
        email: email.toLowerCase().trim(),
        password: passwordHash,
        telefono: telefono || null,
        cedula: cedula.trim(),
        numFederacion: numFederacion || null,
        bio: bio || null,
        especialidades,
        estadoActual: "disponible",
        ultimaActividad: new Date(),
      },
    });

    const token = await crearToken(psicologo.id);
    const res = NextResponse.json({ id: psicologo.id }, { status: 201 });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[POST /api/psicologo/registro]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
