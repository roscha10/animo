"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, AlertTriangle, ChevronRight, ChevronLeft, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";

const SINTOMAS = [
  { id: "ansiedad", emoji: "😰", label: "Ansiedad o pánico" },
  { id: "tristeza", emoji: "😔", label: "Tristeza profunda" },
  { id: "trauma", emoji: "😨", label: "Trauma o miedo intenso" },
  { id: "duelo", emoji: "💔", label: "Duelo o pérdida" },
  { id: "sueno", emoji: "😴", label: "Problemas para dormir" },
  { id: "familia", emoji: "👨‍👩‍👧", label: "Crisis familiar" },
  { id: "soledad", emoji: "🫂", label: "Soledad o aislamiento" },
  { id: "emergencia", emoji: "🚨", label: "Quiero hacerme daño" },
];

const ESTADOS_VE = [
  "Amazonas","Anzoátegui","Apure","Aragua","Barinas","Bolívar","Carabobo",
  "Cojedes","Delta Amacuro","Distrito Capital","Falcón","Guárico","La Guaira",
  "Lara","Mérida","Miranda","Monagas","Nueva Esparta","Portuguesa","Sucre",
  "Táchira","Trujillo","Yaracuy","Zulia",
];

type Paso = 1 | 2 | 3;

export default function NecesitoAyuda() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>(1);
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
    contactoPreferido: "video" as "video" | "llamada" | "chat",
  });

  const esEmergencia = form.sintomas.includes("emergencia");

  function toggleSintoma(id: string) {
    setForm((f) => ({
      ...f,
      sintomas: f.sintomas.includes(id)
        ? f.sintomas.filter((s) => s !== id)
        : [...f.sintomas, id],
    }));
  }

  async function detectarUbicacion() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Guardamos coordenadas; el servidor resolverá ciudad/estado
        setForm((f) => ({
          ...f,
          ciudad: f.ciudad || "Detectando...",
        }));
      },
      () => {}
    );
  }

  async function enviarSolicitud() {
    if (form.sintomas.length === 0) {
      setError("Selecciona al menos una opción de cómo te sientes.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/solicitud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          edad: form.edad ? parseInt(form.edad) : null,
          esEmergencia,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      router.push(`/esperando/${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al enviar la solicitud");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-animo-800 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-animo-200 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <Heart className="text-white w-5 h-5 fill-white" />
        <span className="text-white font-bold text-lg">Ánimo</span>
      </header>

      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 mb-8">
          {([1, 2, 3] as Paso[]).map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  paso >= n
                    ? "bg-animo-600 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {n}
              </div>
              {n < 3 && (
                <div className={`h-0.5 w-8 transition-all ${paso > n ? "bg-animo-600" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-slate-500">
            {paso === 1 && "¿Dónde estás?"}
            {paso === 2 && "¿Cómo te sientes?"}
            {paso === 3 && "¿Cómo quieres hablar?"}
          </span>
        </div>

        {/* PASO 1: Ubicación */}
        {paso === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">¿Dónde estás?</h1>
              <p className="text-slate-500">
                Opcional, pero nos ayuda a conectarte mejor. Puedes usar un nombre ficticio.
              </p>
            </div>

            <div className="card space-y-4">
              <div>
                <label className="label">¿Cómo quieres que te llamemos? (opcional)</label>
                <input
                  className="input"
                  placeholder="Puede ser un apodo"
                  value={form.nombreAnonimo}
                  onChange={(e) => setForm((f) => ({ ...f, nombreAnonimo: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Edad (opcional)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Tu edad"
                  min={10}
                  max={99}
                  value={form.edad}
                  onChange={(e) => setForm((f) => ({ ...f, edad: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Estado de Venezuela</label>
                <select
                  className="input"
                  value={form.estadoVe}
                  onChange={(e) => setForm((f) => ({ ...f, estadoVe: e.target.value }))}
                >
                  <option value="">Selecciona tu estado...</option>
                  {ESTADOS_VE.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ciudad (opcional)</label>
                <div className="flex gap-2">
                  <input
                    className="input"
                    placeholder="Tu ciudad"
                    value={form.ciudad}
                    onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={detectarUbicacion}
                    className="flex-shrink-0 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    title="Detectar ubicación"
                  >
                    <MapPin className="w-5 h-5 text-animo-600" />
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setPaso(2)} className="btn-primary w-full flex items-center justify-center gap-2">
              Continuar <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* PASO 2: Síntomas */}
        {paso === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">¿Cómo te sientes?</h1>
              <p className="text-slate-500">Selecciona todo lo que aplique</p>
            </div>

            {/* Alerta de emergencia */}
            {esEmergencia && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Estamos aquí contigo</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    Tu solicitud tendrá prioridad máxima. Un psicólogo te atenderá de inmediato.
                    Si estás en peligro inmediato, llama al{" "}
                    <strong>171 (Venezuela)</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {SINTOMAS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSintoma(s.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                    form.sintomas.includes(s.id)
                      ? s.id === "emergencia"
                        ? "border-red-400 bg-red-50"
                        : "border-animo-400 bg-animo-50"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <span className="text-2xl block mb-1">{s.emoji}</span>
                  <span className={`text-sm font-medium ${s.id === "emergencia" ? "text-red-700" : "text-slate-700"}`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Nivel de crisis */}
            <div className="card">
              <label className="label mb-3">¿Qué tan intenso sientes esto ahora?</label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Leve</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.nivelCrisis}
                  onChange={(e) => setForm((f) => ({ ...f, nivelCrisis: parseInt(e.target.value) }))}
                  className="flex-1 accent-animo-600"
                />
                <span className="text-sm text-slate-400">Severo</span>
                <span className="w-6 h-6 rounded-full bg-animo-600 text-white text-xs flex items-center justify-center font-bold">
                  {form.nivelCrisis}
                </span>
              </div>
            </div>

            {/* Descripción libre */}
            <div>
              <label className="label">¿Quieres contarnos algo más? (opcional)</label>
              <textarea
                className="input min-h-[100px] resize-none"
                placeholder="Cuéntanos con tus palabras cómo te sientes..."
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setPaso(1)} className="btn-secondary flex-1">
                Volver
              </button>
              <button
                onClick={() => {
                  if (form.sintomas.length === 0) {
                    setError("Selecciona al menos cómo te sientes");
                    return;
                  }
                  setError("");
                  setPaso(3);
                }}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Tipo de contacto */}
        {paso === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">¿Cómo prefieres hablar?</h1>
              <p className="text-slate-500">El psicólogo se adaptará a tu elección</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "video" as const,
                  emoji: "📹",
                  label: "Videollamada",
                  desc: "Cara a cara por Jitsi Meet, sin necesidad de instalar nada",
                },
                {
                  id: "llamada" as const,
                  emoji: "📞",
                  label: "Llamada de voz",
                  desc: "Solo audio, más privado",
                },
                {
                  id: "chat" as const,
                  emoji: "💬",
                  label: "Chat escrito",
                  desc: "Escrito, a tu ritmo, sin cámara ni micrófono",
                },
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, contactoPreferido: op.id }))}
                  className={`w-full p-4 rounded-2xl border-2 text-left flex items-start gap-4 transition-all ${
                    form.contactoPreferido === op.id
                      ? "border-animo-400 bg-animo-50"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <span className="text-3xl">{op.emoji}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{op.label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{op.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setPaso(2)} className="btn-secondary flex-1">
                Volver
              </button>
              <button
                onClick={enviarSolicitud}
                disabled={cargando}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>Pedir ayuda ahora</>
                )}
              </button>
            </div>

            <p className="text-xs text-center text-slate-400">
              Tu información es confidencial y no será compartida fuera de esta sesión.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
