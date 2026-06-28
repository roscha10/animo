import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { api } from "../lib/api";

export default function PsicologoLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");
    try {
      await api.post("/auth/login", form);
      navigate("/psicologo/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-animo-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 bg-animo-600 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-white text-xl">Ánimo</span>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">Acceso psicólogos</h1>
        <p className="text-animo-400 text-center text-sm mb-8">Panel de voluntarios</p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            className="w-full bg-animo-900 border border-animo-800 text-white placeholder-animo-600 rounded-xl px-4 py-3 focus:outline-none focus:border-animo-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            className="w-full bg-animo-900 border border-animo-800 text-white placeholder-animo-600 rounded-xl px-4 py-3 focus:outline-none focus:border-animo-500"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-animo-600 hover:bg-animo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {cargando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-animo-500 text-sm mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/psicologo/registro" className="text-animo-400 hover:text-animo-300 underline">
            Regístrate como voluntario
          </Link>
        </p>
        <p className="text-center mt-4">
          <Link to="/" className="text-animo-600 hover:text-animo-500 text-sm transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
