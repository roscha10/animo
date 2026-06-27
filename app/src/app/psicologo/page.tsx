"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Shield } from "lucide-react";
import Link from "next/link";

export default function LoginPsicologo() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/psicologo/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar sesión");
      router.push("/psicologo/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-animo-950 to-animo-700 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="text-white w-6 h-6 fill-white" />
          <span className="text-white text-2xl font-bold">Ánimo</span>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-animo-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-animo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Portal del Psicólogo</h1>
              <p className="text-sm text-slate-500">Acceso para voluntarios certificados</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                required
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                className="input"
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={cargando} className="btn-primary w-full flex items-center justify-center gap-2">
              {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ingresar"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-3">¿Eres psicólogo y quieres ser voluntario?</p>
            <Link href="/psicologo/registro" className="btn-secondary w-full block text-center">
              Registrarme como voluntario
            </Link>
          </div>
        </div>

        <p className="text-center text-animo-200 text-xs mt-6">
          Solo para psicólogos certificados por la Federación de Psicólogos de Venezuela
        </p>
      </div>
    </main>
  );
}
