import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { api } from "../lib/api";

const ESPECIALIDADES = [
  "Ansiedad y trastornos de pánico","Depresión","Trauma y PTSD",
  "Duelo y pérdida","Terapia de pareja","Adicciones",
  "Trastornos alimentarios","Psicología infantil","Orientación vocacional","General",
];

const INPUT = "w-full bg-animo-900 border border-animo-800 text-white placeholder-animo-600 rounded-xl px-4 py-3 focus:outline-none focus:border-animo-500";

export default function PsicologoRegistro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", email: "", password: "", cedula: "",
    num_federacion: "", telefono: "", bio: "", anos_experiencia: 0,
  });
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  function toggleEspecialidad(e: string) {
    setEspecialidades((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (especialidades.length === 0) {
      setError("Selecciona al menos una especialidad");
      return;
    }
    setCargando(true);
    setError("");
    try {
      await api.post("/auth/registro", { ...form, especialidades });
      navigate("/psicologo/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-animo-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-animo-600 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-white text-xl">Ánimo</span>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">Únete como voluntario</h1>
        <p className="text-animo-400 text-center text-sm mb-8">Tu tiempo puede cambiar vidas</p>

        <form onSubmit={submit} className="space-y-4">

          {/* Datos personales */}
          <p className="text-animo-400 text-xs font-semibold uppercase tracking-wider">Datos personales</p>
          <input placeholder="Nombre completo" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} required className={INPUT} />
          <input type="email" placeholder="Correo electrónico" value={form.email} onChange={(e) => set("email", e.target.value)} required className={INPUT} />
          <input type="password" placeholder="Contraseña (mín. 8 caracteres)" minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} required className={INPUT} />
          <input placeholder="Teléfono (opcional)" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} className={INPUT} />

          {/* Credenciales */}
          <p className="text-animo-400 text-xs font-semibold uppercase tracking-wider pt-2">Credenciales</p>
          <input placeholder="Número de cédula profesional" value={form.cedula} onChange={(e) => set("cedula", e.target.value)} required className={INPUT} />
          <input placeholder="Número de federación FPV (opcional)" value={form.num_federacion} onChange={(e) => set("num_federacion", e.target.value)} className={INPUT} />
          <div>
            <label className="text-animo-400 text-sm block mb-1">Años de experiencia</label>
            <input type="number" min={0} value={form.anos_experiencia} onChange={(e) => set("anos_experiencia", parseInt(e.target.value) || 0)} className={INPUT} />
          </div>

          {/* Especialidades */}
          <p className="text-animo-400 text-xs font-semibold uppercase tracking-wider pt-2">
            Especialidades <span className="text-red-400">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {ESPECIALIDADES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => toggleEspecialidad(e)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  especialidades.includes(e)
                    ? "bg-animo-600 text-white"
                    : "bg-animo-900 border border-animo-700 text-animo-400 hover:border-animo-500"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          {/* Bio */}
          <p className="text-animo-400 text-xs font-semibold uppercase tracking-wider pt-2">Presentación</p>
          <textarea
            placeholder="Cuéntanos sobre tu experiencia y enfoque terapéutico (opcional)"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            className="w-full bg-animo-900 border border-animo-800 text-white placeholder-animo-600 rounded-xl px-4 py-3 focus:outline-none focus:border-animo-500 resize-none"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-animo-600 hover:bg-animo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {cargando ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-animo-500 text-sm mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link to="/psicologo/login" className="text-animo-400 hover:text-animo-300 underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
