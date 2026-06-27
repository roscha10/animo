"use client";

import { useEffect, useState, use } from "react";
import { Heart, Phone, Video, MessageCircle, Loader2 } from "lucide-react";

interface DatosSesion {
  id: string;
  tipo: string;
  salaJitsi?: string;
  solicitud: {
    nombreAnonimo?: string;
    sintomas: string[];
    descripcion?: string;
  };
  psicologo: {
    nombre: string;
  };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JitsiMeetExternalAPI: any;
  }
}

export default function SesionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sesion, setSesion] = useState<DatosSesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [jitsiListo, setJitsiListo] = useState(false);

  useEffect(() => {
    fetch(`/api/sesion/${id}`)
      .then((r) => r.json())
      .then(setSesion)
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    if (!sesion || sesion.tipo !== "video" || !sesion.salaJitsi) return;

    // Carga el script de Jitsi si no está cargado
    if (window.JitsiMeetExternalAPI) {
      iniciarJitsi(sesion.salaJitsi);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => iniciarJitsi(sesion.salaJitsi!);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [sesion]);

  function iniciarJitsi(sala: string) {
    const container = document.getElementById("jitsi-container");
    if (!container) return;

    new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName: `animo-${sala}`,
      parentNode: container,
      width: "100%",
      height: "100%",
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        TOOLBAR_BUTTONS: ["microphone", "camera", "hangup", "chat", "tileview"],
      },
    });
    setJitsiListo(true);
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-animo-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!sesion) {
    return (
      <div className="min-h-screen bg-animo-950 flex items-center justify-center">
        <p className="text-animo-200">Sesión no encontrada</p>
      </div>
    );
  }

  const IconoTipo = sesion.tipo === "video" ? Video : sesion.tipo === "llamada" ? Phone : MessageCircle;

  return (
    <main className="min-h-screen bg-animo-950 flex flex-col">
      {/* Header mínimo */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-animo-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="text-white w-4 h-4 fill-white" />
          <span className="text-white font-bold">Ánimo</span>
          <span className="text-animo-400 text-sm mx-2">·</span>
          <IconoTipo className="w-4 h-4 text-animo-300" />
          <span className="text-animo-300 text-sm capitalize">{sesion.tipo}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">En sesión</span>
        </div>
      </header>

      {/* Contenido de la sesión */}
      <div className="flex-1 flex flex-col">
        {sesion.tipo === "video" && (
          <div
            id="jitsi-container"
            className="flex-1 min-h-[calc(100vh-56px)]"
            style={{ display: jitsiListo ? "block" : "flex", alignItems: "center", justifyContent: "center" }}
          >
            {!jitsiListo && <Loader2 className="w-8 h-8 text-white animate-spin" />}
          </div>
        )}

        {sesion.tipo === "chat" && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-animo-400 mx-auto mb-4" />
              <p className="text-white text-lg font-semibold">Chat próximamente</p>
              <p className="text-animo-300 text-sm mt-2">
                Por ahora usa Jitsi para la sesión. El chat integrado llega en la siguiente versión.
              </p>
            </div>
          </div>
        )}

        {sesion.tipo === "llamada" && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-animo-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <p className="text-white text-lg font-semibold mb-2">Sesión de llamada</p>
              <p className="text-animo-300 text-sm">
                El psicólogo se comunicará contigo directamente.
                <br />Mantente disponible.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm">Conectado</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
