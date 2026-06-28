import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronRight, ChevronLeft, AlertTriangle, Phone } from "lucide-react";
import { api } from "../lib/api";

const SINTOMAS_OPCIONES = [
  "Ansiedad", "Tristeza profunda", "Pensamientos de hacerme daño",
  "Crisis de pánico", "Soledad extrema", "Estrés laboral o económico",
  "Problemas de pareja o familia", "Duelo o pérdida", "Insomnio",
  "Bajo autoestima", "Consumo de sustancias", "Otro",
];

const ESTADOS_VE = [
  "Amazonas","Anzoátegui","Apure","Aragua","Barinas","Bolívar","Carabobo",
  "Cojedes","Delta Amacuro","Distrito Capital","Falcón","Guárico","Lara",
  "Mérida","Miranda","Monagas","Nueva Esparta","Portuguesa","Sucre",
  "Táchira","Trujillo","La Guaira","Yaracuy","Zulia","Fuera de Venezuela",
];

export default function NecesitoAyuda() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombreAnonimo: "",
    edad: "",
    ciudad: "",
    estadoVe: "",
    sintomas: [] as string[],
    descripcion: "",
    nivelCrisis: 3,
    esEmergencia: false,
    contactoPreferido: "video",
  });

  const toggle = (s: string) =>
    setForm((f) => ({
      ...f,
      sintomas: f.sintomas.includes(s) ? f.sintomas.filter((x) => x !== s) : [...f.sintomas, s],
    }));

  useEffect(() => {
    if (paso !== 2) return;
    api.get("/geoip").then((data: any) => {
      setForm((f) => ({
        ...f,
        ciudad: f.ciudad || data.ciudad || "",
        estadoVe: f.estadoVe || data.estado_ve || "",
      }));
    }).catch(() => {});
  }, [paso]);

  async function enviar() {
    if (!form.sintomas.length) { setError("Selecciona al menos un síntoma"); return; }
    setCargando(true);
    setError("");
    try {
      const { id } = await api.post("/solicitud", {
        nombre_anonimo: form.nombreAnonimo || null,
        edad: form.edad ? parseInt(form.edad) : null,
        ciudad: form.ciudad || null,
        estado_ve: form.estadoVe || null,
        sintomas: form.sintomas,
        descripcion: form.descripcion || null,
        nivel_crisis: form.nivelCrisis,
        es_emergencia: form.esEmergencia,
        contacto_preferido: form.contactoPreferido,
      });
      navigate(`/gracias?id=${id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-animo-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-6">
        <div className="w-8 h-8 bg-animo-600 rounded-lg flex items-center justify-center">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="font-bold text-white text-lg">Ánimo</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${n <= paso ? "bg-animo-500" : "bg-animo-800"}`} />
            ))}
          </div>

          {/* PASO 1 — Cómo te sientes */}
          {paso === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">¿Cómo te sientes?</h1>
              <p className="text-animo-400 mb-6">Selecciona todo lo que aplique. Es confidencial.</p>

              {form.sintomas.includes("Pensamientos de hacerme daño") && (
                <div className="bg-red-950 border border-red-700 rounded-xl p-4 mb-6 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Si estás en peligro inmediato</p>
                    <a href="tel:171" className="text-red-400 text-sm flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" /> Llama al 171 ahora
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-8">
                {SINTOMAS_OPCIONES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    className={`p-3 rounded-xl text-sm text-left border transition-all ${
                      form.sintomas.includes(s)
                        ? "bg-animo-600 border-animo-500 text-white font-medium"
                        : "bg-animo-900 border-animo-800 text-animo-300 hover:border-animo-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="text-animo-300 text-sm block mb-2">Nivel de crisis (1 = leve, 5 = muy alto)</label>
                <input
                  type="range" min={1} max={5} value={form.nivelCrisis}
                  onChange={(e) => setForm((f) => ({ ...f, nivelCrisis: +e.target.value }))}
                  className="w-full accent-animo-500"
                />
                <div className="flex justify-between text-animo-500 text-xs mt-1">
                  <span>Leve</span><span className="font-bold text-animo-400">{form.nivelCrisis}/5</span><span>Muy alto</span>
                </div>
              </div>

              <button
                onClick={() => { if (!form.sintomas.length) { setError("Selecciona al menos uno"); return; } setError(""); setPaso(2); }}
                disabled={!form.sintomas.length}
                className="w-full bg-animo-600 hover:bg-animo-500 disabled:opacity-40 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
              {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
            </div>
          )}

          {/* PASO 2 — Datos opcionales */}
          {paso === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Cuéntanos un poco más</h1>
              <p className="text-animo-400 mb-6">Todo es opcional y anónimo.</p>

              <div className="space-y-4 mb-8">
                <input
                  placeholder="¿Cómo quieres que te llamemos? (opcional)"
                  value={form.nombreAnonimo}
                  onChange={(e) => setForm((f) => ({ ...f, nombreAnonimo: e.target.value }))}
                  className="w-full bg-animo-900 border border-animo-800 text-white placeholder-animo-600 rounded-xl px-4 py-3 focus:outline-none focus:border-animo-500"
                />
                <input
                  placeholder="Edad (opcional)"
                  type="number"
                  value={form.edad}
                  onChange={(e) => setForm((f) => ({ ...f, edad: e.target.value }))}
                  className="w-full bg-animo-900 border border-animo-800 text-white placeholder-animo-600 rounded-xl px-4 py-3 focus:outline-none focus:border-animo-500"
                />
                <select
                  value={form.estadoVe}
                  onChange={(e) => setForm((f) => ({ ...f, estadoVe: e.target.value }))}
                  className="w-full bg-animo-900 border border-animo-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-animo-500"
                >
                  <option value="">Estado o región (opcional)</option>
                  {ESTADOS_VE.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                <input
                  placeholder="Ciudad (opcional)"
                  value={form.ciudad}
                  onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))}
                  className="w-full bg-animo-900 border border-animo-800 text-white placeholder-animo-600 rounded-xl px-4 py-3 focus:outline-none focus:border-animo-500"
                />
                <textarea
                  placeholder="¿Quieres contarnos algo más? (opcional)"
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={3}
                  className="w-full bg-animo-900 border border-animo-800 text-white placeholder-animo-600 rounded-xl px-4 py-3 focus:outline-none focus:border-animo-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPaso(1)} className="flex-1 border border-animo-700 text-animo-300 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-animo-900 transition-colors">
                  <ChevronLeft className="w-5 h-5" /> Atrás
                </button>
                <button onClick={() => setPaso(3)} className="flex-1 bg-animo-600 hover:bg-animo-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                  Continuar <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 — Tipo de sesión */}
          {paso === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">¿Cómo prefieres hablar?</h1>
              <p className="text-animo-400 mb-6">El psicólogo se conectará contigo por esta vía.</p>

              <div className="space-y-3 mb-8">
                {[
                  { valor: "video", emoji: "📹", titulo: "Videollamada", desc: "Cara a cara, más cercano" },
                  { valor: "llamada", emoji: "📞", titulo: "Llamada de voz", desc: "Solo audio, sin cámara" },
                  { valor: "chat", emoji: "💬", titulo: "Chat de texto", desc: "Por escrito, más cómodo" },
                ].map((op) => (
                  <button
                    key={op.valor}
                    onClick={() => setForm((f) => ({ ...f, contactoPreferido: op.valor }))}
                    className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
                      form.contactoPreferido === op.valor
                        ? "bg-animo-600 border-animo-500"
                        : "bg-animo-900 border-animo-800 hover:border-animo-600"
                    }`}
                  >
                    <span className="text-2xl">{op.emoji}</span>
                    <div>
                      <p className="text-white font-semibold">{op.titulo}</p>
                      <p className="text-animo-400 text-sm">{op.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setPaso(2)} className="flex-1 border border-animo-700 text-animo-300 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-animo-900 transition-colors">
                  <ChevronLeft className="w-5 h-5" /> Atrás
                </button>
                <button
                  onClick={enviar}
                  disabled={cargando}
                  className="flex-1 bg-animo-500 hover:bg-animo-400 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                >
                  {cargando ? "Enviando..." : <>Pedir ayuda <Heart className="w-4 h-4 fill-white" /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
