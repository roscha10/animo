import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const solicitud = await prisma.solicitudAyuda.findUnique({
      where: { id },
      select: {
        estadoSolicitud: true,
        sesion: { select: { id: true } },
        psicologo: { select: { nombre: true } },
      },
    });

    if (!solicitud) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      estadoSolicitud: solicitud.estadoSolicitud,
      sesionId: solicitud.sesion?.id,
      psicologoNombre: solicitud.psicologo?.nombre,
    });
  } catch (err) {
    console.error("[GET /api/solicitud/[id]]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
