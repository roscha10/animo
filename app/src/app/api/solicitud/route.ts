import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { detectarUbicacionPorIP, obtenerIPReal } from "@/lib/geoip";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nombreAnonimo, edad, ciudad, estadoVe,
      sintomas, descripcion, nivelCrisis, esEmergencia, contactoPreferido,
    } = body;

    if (!sintomas?.length) {
      return NextResponse.json({ error: "Debes indicar cómo te sientes" }, { status: 400 });
    }
    if (!["video", "llamada", "chat"].includes(contactoPreferido)) {
      return NextResponse.json({ error: "Tipo de contacto inválido" }, { status: 400 });
    }

    // Intentar detectar ubicación por IP si no se proporcionó estado/ciudad
    let ciudadFinal = ciudad;
    let estadoFinal = estadoVe;
    if (!estadoVe) {
      const ip = obtenerIPReal(req);
      const ubicacion = await detectarUbicacionPorIP(ip);
      ciudadFinal = ciudad || ubicacion.ciudad;
      estadoFinal = estadoVe || ubicacion.estado;
    }

    const solicitud = await prisma.solicitudAyuda.create({
      data: {
        nombreAnonimo: nombreAnonimo || null,
        edad: edad || null,
        ciudad: ciudadFinal || null,
        estadoVe: estadoFinal || null,
        sintomas: sintomas ?? [],
        descripcion: descripcion || null,
        nivelCrisis: Math.min(5, Math.max(1, nivelCrisis ?? 3)),
        esEmergencia: !!esEmergencia,
        contactoPreferido,
        estadoSolicitud: "esperando",
      },
    });

    return NextResponse.json({ id: solicitud.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/solicitud]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
