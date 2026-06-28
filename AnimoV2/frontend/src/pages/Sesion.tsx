import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, X } from "lucide-react";
import { api } from "../lib/api";

declare global {
  interface Window { JitsiMeetExternalAPI: any; }
}

interface SesionData {
  id: string;
  sala_jitsi: string;
  mi_rol: string;
  completado_en: string | null;
}

export default function Sesion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jitsiRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [sesion, setSesion] = useState<SesionData | null>(null);
  const [modal, setModal] = useState(false);
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/sesion/${id}`).then(setSesion).catch(() => navigate("/psicologo/login"));
  }, [id, navigate]);

  useEffect(() => {
    if (!sesion) return;

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      if (!jitsiRef.current) return;
      apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: sesion.sala_jitsi,
        parentNode: jitsiRef.current,
        width: "100%",
        height: "100%",
        configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: sesion.mi_rol === "paciente" },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, TOOLBAR_BUTTONS: ["microphone","camera","hangup","chat","tileview"] },
      });
    };
    document.body.appendChild(script);

    // Si es paciente, poll para detectar fin de sesión
    let interval: ReturnType<typeof setInterval>;
    if (sesion.mi_rol === "paciente") {
      interval = setInterval(async () => {
        try {
          const data = await api.get(`/sesion/${id}`);
          if (data.completado_en) navigate("/gracias");
        } catch {}
      }, 5000);
    }

    return () => {
      apiRef.current?.dispose();
      clearInterval(interval);
    };
  }, [sesion, id, navigate]);

  async function terminar() {
    if (!id) return;
    setGuardando(true);
    try {
      await api.put(`/sesion/${id}/terminar`, { notas });
      navigate("/psicologo/dashboard");
    } catch {
      setGuardando(false);
    }
  }

  return (
    <div className="h-screen bg-animo-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-animo-950 border-b border-animo-900">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-animo-400 fill-animo-400" />
          <span className="font-bold text-white">Ánimo</span>
          <span className="text-animo-600 text-sm">· Sesión activa</span>
        </div>
        {sesion?.mi_rol === "psicologo" && (
          <button
            onClick={() => setModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" /> Terminar sesión
          </button>
        )}
      </div>

      {/* Jitsi */}
      <div ref={jitsiRef} className="flex-1" />

      {/* Modal terminar */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-animo-950 border border-animo-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-xl mb-2">Terminar sesión</h2>
            <p className="text-animo-400 text-sm mb-4">Agrega notas clínicas privadas (solo las verás tú).</p>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones, seguimiento recomendado..."
              rows={4}
              className="w-full bg-animo-900 border border-animo-700 text-white placeholder-animo-600 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-animo-500 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 border border-animo-700 text-animo-300 py-3 rounded-xl hover:bg-animo-900 transition-colors">
                Cancelar
              </button>
              <button onClick={terminar} disabled={guardando} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                {guardando ? "Guardando..." : "Confirmar fin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
