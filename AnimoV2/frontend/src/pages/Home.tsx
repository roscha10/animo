import { Link } from "react-router-dom";
import { Heart, Shield, Clock, Phone, ChevronRight, Star } from "lucide-react";

const PASOS = [
  { n: "01", titulo: "Cuéntanos cómo te sientes", desc: "Llena un formulario breve y anónimo. No necesitas registrarte ni dar tu nombre real." },
  { n: "02", titulo: "Un psicólogo te contacta", desc: "En minutos, un profesional certificado acepta tu solicitud y se conecta contigo." },
  { n: "03", titulo: "Habla con total confianza", desc: "Sesión por videollamada, llamada o chat. Completamente privada y gratuita." },
];

const PSICOLOGOS = [
  { nombre: "Dra. Ana González", especialidad: "Ansiedad y depresión", sesiones: 142 },
  { nombre: "Dr. Carlos Méndez", especialidad: "Crisis y trauma", sesiones: 98 },
  { nombre: "Lic. María Pérez", especialidad: "Duelo y pérdida", sesiones: 211 },
];

const SINTOMAS = [
  "Ansiedad", "Tristeza profunda", "Pensamientos negativos",
  "Soledad", "Crisis de pánico", "Estrés extremo",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-animo-600 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-animo-950 text-lg">Ánimo</span>
            <span className="text-slate-400 text-xs hidden sm:block ml-1">Kaimind × Vikua</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/psicologo/login" className="text-sm text-slate-500 hover:text-animo-700 transition-colors hidden sm:block">
              Soy psicólogo
            </Link>
            <Link to="/necesito-ayuda" className="bg-animo-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-animo-700 transition-colors">
              Necesito ayuda
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-animo-950 to-animo-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-animo-800/60 border border-animo-700 rounded-full px-4 py-1.5 text-sm text-animo-300 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Psicólogos disponibles ahora
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            No estás solo.{" "}
            <span className="text-animo-400">Estamos aquí</span>{" "}
            para escucharte.
          </h1>

          <p className="text-animo-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Conectamos a venezolanos con psicólogos voluntarios certificados.
            Gratuito, confidencial y sin necesidad de registro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/necesito-ayuda"
              className="bg-animo-500 hover:bg-animo-400 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-animo-900"
            >
              Hablar con un psicólogo
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:171"
              className="border border-animo-600 text-animo-300 hover:bg-animo-800 font-semibold px-8 py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Línea 171 (emergencias)
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-animo-300 text-sm">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> 100% gratuito</div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Confidencial</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Disponible ahora</div>
          </div>
        </div>
      </section>

      {/* SÍNTOMAS */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-6">Podemos ayudarte si sientes</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SINTOMAS.map((s) => (
              <span key={s} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm shadow-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Cómo funciona?</h2>
            <p className="text-slate-500 text-lg">Tres pasos, menos de 5 minutos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PASOS.map((p) => (
              <div key={p.n} className="relative">
                <div className="text-6xl font-black text-animo-100 mb-4 leading-none">{p.n}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{p.titulo}</h3>
                <p className="text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/necesito-ayuda"
              className="inline-flex items-center gap-2 bg-animo-600 hover:bg-animo-700 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-colors"
            >
              Comenzar ahora <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* PSICÓLOGOS */}
      <section className="py-20 px-4 bg-animo-950 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Profesionales que te apoyan</h2>
            <p className="text-animo-300 text-lg">Psicólogos certificados, venezolanos como tú.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PSICOLOGOS.map((p) => (
              <div key={p.nombre} className="bg-animo-900 border border-animo-800 rounded-2xl p-6">
                <div className="w-16 h-16 bg-animo-700 rounded-full flex items-center justify-center text-2xl font-bold text-animo-300 mb-4">
                  {p.nombre.charAt(p.nombre.indexOf(" ") + 1)}
                </div>
                <h3 className="font-bold text-lg mb-1">{p.nombre}</h3>
                <p className="text-animo-400 text-sm mb-4">{p.especialidad}</p>
                <div className="flex items-center gap-1 text-animo-300 text-sm">
                  <Star className="w-4 h-4 fill-animo-400 text-animo-400" />
                  <span>{p.sesiones} sesiones completadas</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-animo-500 text-sm mt-8">
            ¿Eres psicólogo? <Link to="/psicologo/registro" className="text-animo-400 underline hover:text-animo-300">Únete como voluntario</Link>
          </p>
        </div>
      </section>

      {/* EMERGENCIA */}
      <section className="py-16 px-4 bg-red-50 border-t border-red-100">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-3xl mb-4">🆘</div>
          <h2 className="text-2xl font-bold text-red-900 mb-3">¿Estás en crisis ahora mismo?</h2>
          <p className="text-red-700 mb-6">Si estás pensando en hacerte daño, llama de inmediato a la línea de emergencias.</p>
          <a
            href="tel:171"
            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-8 py-4 rounded-2xl transition-colors"
          >
            <Phone className="w-6 h-6" />
            Llamar al 171
          </a>
          <p className="text-red-500 text-sm mt-4">Gratuito · Disponible 24/7 · Venezuela</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-animo-950 text-animo-400 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-animo-500 fill-animo-500" />
            <span className="font-bold text-white">Ánimo</span>
            <span className="text-animo-600 text-sm">· Una alianza de Kaimind × Vikua</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/necesito-ayuda" className="hover:text-animo-300 transition-colors">Pedir ayuda</Link>
            <Link to="/psicologo/registro" className="hover:text-animo-300 transition-colors">Ser voluntario</Link>
            <Link to="/privacidad" className="hover:text-animo-300 transition-colors">Privacidad</Link>
          </div>
          <p className="text-animo-700 text-xs">© 2025 Ánimo · Gratuito y confidencial</p>
        </div>
      </footer>
    </div>
  );
}
