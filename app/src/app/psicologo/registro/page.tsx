"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ChevronLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

const ESPECIALIDADES = [
  { id: "ansiedad", label: "Ansiedad y pánico" },
  { id: "trauma", label: "Trauma y PTSD" },
  { id: "duelo", label: "Duelo y pérdida" },
  { id: "depresion", label: "Depresión" },
  { id: "infantil", label: "Psicología infantil" },
  { id: "familiar", label: "Terapia familiar" },
  { id: "crisis", label: "Intervención en crisis" },
  { id: "general", label: "Psicología general" },
];

export default function RegistroPsicologo() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exitoso, setExitoso] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
    telefono: "",
    cedula: "",
    numFederacion: "",
    bio: "",
    especialidades: [] as string[],
  });

  function toggleEspecialidad(id: string) {
    setForm((f) => ({
      ...f,
      especialidades: f.especialidades.includes(id)
        ? f.especialidades.filter((e) => e !== id)
        : [...f.especialidades, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.especialidades.length === 0) {
      setError("Selecciona al menos una especialidad");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/psicologo/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al registrarse");
      setExitoso(true);
      setTimeout(() => router.push("/psicologo/dashboard"), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al registrarse");
    } finally {
      setCargando(false);
    }
  }

  if (exitoso) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-animo-950 to-animo-700 flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">¡Bienvenido al equipo!</h2>
          <p className="text-animo-200">Gracias por ser voluntario. Entrando al dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-animo-800 px-6 py-4 flex items-center gap-3">
        <Link href="/psicologo" className="text-animo-200 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <Heart className="text-white w-5 h-5 fill-white" />
        <span className="text-white font-bold">Registro de voluntario</span>
      </header>

      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Únete como psicólogo voluntario</h1>
          <p className="text-slate-500 mt-1">Tu ayuda puede cambiar una vida</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos personales */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-700">Datos personales</h2>
            <div>
              <label className="label">Nombre completo *</label>
              <input className="input" required placeholder="Dr./Lic. Nombre Apellido"
                value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
            </div>
            <div>
              <label className="label">Correo electrónico *</label>
              <input className="input" type="email" required placeholder="tu@email.com"
                value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Teléfono (opcional)</label>
              <input className="input" type="tel" placeholder="04XX-XXXXXXX"
                value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Contraseña *</label>
                <input className="input" type="password" required placeholder="••••••••" minLength={8}
                  value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="label">Confirmar *</label>
                <input className="input" type="password" required placeholder="••••••••"
                  value={form.confirmarPassword} onChange={(e) => setForm((f) => ({ ...f, confirmarPassword: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Certificación */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-700">Certificación profesional</h2>
            <div>
              <label className="label">Cédula profesional *</label>
              <input className="input" required placeholder="Número de cédula"
                value={form.cedula} onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value }))} />
            </div>
            <div>
              <label className="label">Número de Federación de Psicólogos (opcional)</label>
              <input className="input" placeholder="Nro. de inscripción en la FPV"
                value={form.numFederacion} onChange={(e) => setForm((f) => ({ ...f, numFederacion: e.target.value }))} />
            </div>
          </div>

          {/* Especialidades */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-700">Especialidades *</h2>
            <div className="grid grid-cols-2 gap-2">
              {ESPECIALIDADES.map((esp) => (
                <button key={esp.id} type="button"
                  onClick={() => toggleEspecialidad(esp.id)}
                  className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${
                    form.especialidades.includes(esp.id)
                      ? "border-animo-400 bg-animo-50 text-animo-800 font-medium"
                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                  }`}
                >
                  {esp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="card">
            <label className="label">Presentación breve (opcional)</label>
            <textarea className="input min-h-[90px] resize-none"
              placeholder="Ej: Psicólogo clínico con 10 años de experiencia en trauma..."
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={cargando} className="btn-primary w-full flex items-center justify-center gap-2">
            {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrarme como voluntario"}
          </button>

          <p className="text-xs text-center text-slate-400">
            Al registrarte confirmas que eres psicólogo certificado y que participas voluntariamente.
          </p>
        </form>
      </div>
    </main>
  );
}
