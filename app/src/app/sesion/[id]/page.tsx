"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, Phone, Video, MessageCircle, Loader2, CheckCircle, XCircle } from "lucide-react";

interface DatosSesion {
  id: string;
  tipo: string;
  salaJitsi?: string;
  completadoEn?: string;
  miRol: "psicologo" | "paciente";
  solicitud: {
    nombreAnonimo?: string;
    sintomas: string[];
    descripcion?: string;
    nivelCrisis: number;
    esEmergencia: boolean;
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
  const router = useRouter();
  const [sesion, setSesion] = useState<DatosSesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [jitsiListo, setJitsiListo] = useState(false);
  const [terminando, setTerminando] = useState(false);
  const [notas, setNotas] = useState("");
  const [mostrarNotas, setMostrarNotas] = useState(false);
  const jitsiRef = useRef<unknown>(null);

  useEffect(() => {
    fetch(`/api/sesion/${id}`)
      .then((r) => r.json())
      .then(setSesion)
      .finally(() => setCargando(false));
  }, [id]);

  // Paciente: poll para detectar cuando el psicólogo termina
  useEffect(() => {
    if (!sesion || sesion.miRol !== "paciente") return;
    if (sesion.completadoEn) {
      router.push("/gracias");
      return;
    }
    const interval = setInterval(async () => {
      const res = await fetch(`/api/sesion/${id}`);
      if (!res.ok) return;
      const data: DatosSesion = await res.json();
      if (data.completadoEn) {
        clearInterval(interval);
        router.push("/gracias");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sesion, id, router]);

  useEffect(() => {
    if (!sesion || sesion.tipo !== "video" || !sesion.salaJitsi) return;

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

    const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
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
    jitsiRef.current = api;
    setJitsiListo(true);
  }

  async function terminarSesion() {
    setTerminando(true);
    try {
      const res = await fetch(`/api/sesion/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notas }),
      });
      if (res.ok) {
        router.push("/psicologo/dashboard");
      }
    } finally {
      setTerminando(false);
    }
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
  const esPsicologo = sesion.miRol === "psicologo";

  return (
    <main className="min-h-screen bg-animo-950 flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-animo-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="text-white w-4 h-4 fill-white" />
          <span className="text-white font-bold">Ánimo</span>
          <span className="text-animo-400 text-sm mx-2">·</span>
          <IconoTipo className="w-4 h-4 text-animo-300" />
          <span className="text-animo-300 text-sm capitalize">{sesion.tipo}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">En sesión</span>
          </div>
          {/* Botón terminar — solo para el psicólogo */}
          {esPsicologo && (
            <button
              onClick={() => setMostrarNotas(true)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
            >
              <XCircle className="w-4 h-4" />
              Terminar sesión
            </button>
          )}
        </div>
      </header>

      {/* Modal de notas (solo psicólogo) */}
      {mostrarNotas && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-animo-600" />
              <h3 className="font-bold text-slate-800 text-lg">Terminar sesión</h3>
            </div>
            <p className="text-slate-500 text-sm mb-4">
              Paciente: <strong>{sesion.solicitud.nombreAnonimo || "Anónimo"}</strong>
              {sesion.solicitud.nivelCrisis >= 4 && (
                <span className="ml-2 text-red-600 font-semibold">· Crisis severa</span>
              )}
            </p>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas clínicas (solo visibles para ti)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones, seguimiento recomendado, estado del paciente al cierre..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-animo-400 resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setMostrarNotas(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={terminarSesion}
                disabled={terminando}
                className="flex-1 py-2.5 rounded-xl bg-animo-600 hover:bg-animo-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {terminando ? "Cerrando..." : "Confirmar y cerrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido */}
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

        {sesion.tipo === "llamada" && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-animo-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <p className="text-white text-lg font-semibold mb-2">
                {esPsicologo ? `Paciente: ${sesion.solicitud.nombreAnonimo || "Anónimo"}` : "Sesión de llamada activa"}
              </p>
              <p className="text-animo-300 text-sm">
                {esPsicologo ? "Comunícate directamente con el paciente." : "El psicólogo se comunicará contigo. Mantente disponible."}
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm">Conectado</span>
              </div>
            </div>
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
      </div>
    </main>
  );
}
