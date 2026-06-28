import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Bell, LogOut, Users, Clock, AlertTriangle } from "lucide-react";
import { api } from "../lib/api";

interface Solicitud {
  id: string;
  nombre_anonimo: string | null;
  ciudad: string | null;
  estado_ve: string | null;
  sintomas: string[];
  nivel_crisis: number;
  es_emergencia: boolean;
  contacto_preferido: string;
  creado_en: string;
}

interface Psicologo {
  nombre: string;
  estado_actual: string;
  total_sesiones: number;
}

function sonar() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [yo, setYo] = useState<Psicologo | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [toast, setToast] = useState("");
  const [aceptando, setAceptando] = useState<string | null>(null);
  const prevCount = useRef(0);

  const cargar = useCallback(async () => {
    try {
      const data = await api.get("/solicitud/pendientes");
      if (data.length > prevCount.current) sonar();
      prevCount.current = data.length;
      setSolicitudes(data);
    } catch {
      navigate("/psicologo/login");
    }
  }, [navigate]);

  useEffect(() => {
    api.get("/auth/me").then(setYo).catch(() => navigate("/psicologo/login"));
    cargar();
    const t = setInterval(cargar, 3000);
    return () => clearInterval(t);
  }, [cargar, navigate]);

  async function cambiarEstado(estado: string) {
    await api.put("/psicologo/estado", { estado });
    setYo((p) => p ? { ...p, estado_actual: estado } : p);
  }

  async function aceptar(id: string) {
    setAceptando(id);
    try {
      const data = await api.post(`/solicitud/${id}/aceptar`, {});
      navigate(`/sesion/${data.sesion_id}`);
    } catch (e: any) {
      if (e.message?.includes("ya fue tomada")) {
        setToast("Ese paciente ya fue atendido por otro psicólogo");
        setTimeout(() => setToast(""), 4000);
        cargar();
      }
    } finally {
      setAceptando(null);
    }
  }

  async function logout() {
    await api.post("/auth/logout", {});
    navigate("/");
  }

  const disponible = yo?.estado_actual === "disponible";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-animo-950 text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-animo-400 fill-animo-400" />
            <span className="font-bold">Ánimo</span>
            {yo && <span className="text-animo-400 text-sm ml-2">· {yo.nombre}</span>}
          </div>
          <button onClick={logout} className="text-animo-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Estado */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${disponible ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
            <span className="font-semibold text-slate-800">
              {disponible ? "Disponible para atender" : "No disponible"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-500 text-sm">
              <Users className="w-4 h-4" />
              <span>{yo?.total_sesiones ?? 0} sesiones</span>
            </div>
            <button
              onClick={() => cambiarEstado(disponible ? "no_disponible" : "disponible")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                disponible
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-animo-600 text-white hover:bg-animo-700"
              }`}
            >
              {disponible ? "Pausar" : "Activarme"}
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm text-center">
            {toast}
          </div>
        )}

        {/* Solicitudes */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-animo-600" />
            <h2 className="font-bold text-slate-800">Pacientes esperando</h2>
            {solicitudes.length > 0 && (
              <span className="bg-animo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
                {solicitudes.length}
              </span>
            )}
          </div>

          {solicitudes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Ningún paciente esperando en este momento.</p>
              <p className="text-slate-400 text-sm mt-1">Revisamos cada 3 segundos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitudes.map((s) => (
                <div
                  key={s.id}
                  className={`bg-white rounded-2xl border p-5 ${
                    s.es_emergencia ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                >
                  {s.es_emergencia && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-semibold mb-3">
                      <AlertTriangle className="w-4 h-4" /> CASO URGENTE
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-800">{s.nombre_anonimo || "Anónimo"}</span>
                        {[s.ciudad, s.estado_ve].filter(Boolean).length > 0 && (
                          <span className="text-slate-400 text-sm">· {[s.ciudad, s.estado_ve].filter(Boolean).join(", ")}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {s.sintomas.map((t) => (
                          <span key={t} className="bg-animo-50 text-animo-700 text-xs px-2 py-1 rounded-full border border-animo-100">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Crisis: {s.nivel_crisis}/5</span>
                        <span className="capitalize">{s.contacto_preferido}</span>
                        <span>{new Date(s.creado_en).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => aceptar(s.id)}
                      disabled={aceptando === s.id}
                      className="bg-animo-600 hover:bg-animo-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors"
                    >
                      {aceptando === s.id ? "..." : "Atender ahora"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
