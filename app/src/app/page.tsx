import Link from "next/link";
import Image from "next/image";
import { Heart, Shield, Video, Phone, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-animo-950 via-animo-800 to-animo-600 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Heart className="text-white w-7 h-7 fill-white" />
          <span className="text-white text-2xl font-bold tracking-tight">Ánimo</span>
        </div>
        {/* Co-branding Kaimind × Vikua */}
        <div className="flex items-center gap-3">
          <span className="text-animo-300 text-xs hidden sm:block">Una alianza de</span>
          <div className="flex items-center gap-3">
            <Image
              src="/logos/kaimind.png"
              alt="Kaimind"
              width={100}
              height={28}
              className="h-7 w-auto object-contain"
            />
            <span className="text-animo-400 text-sm">×</span>
            <Image
              src="/logos/vikua.png"
              alt="Vikua"
              width={80}
              height={28}
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-white/10 text-animo-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            100% gratuito · Sin registro previo · Venezuela
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4">
            Estás aquí.
            <br />
            <span className="text-animo-200">No estás solo.</span>
          </h1>

          <p className="text-animo-100 text-lg sm:text-xl mb-12 leading-relaxed">
            Conectamos a personas que necesitan apoyo emocional con{" "}
            <strong className="text-white">psicólogos venezolanos voluntarios</strong>,
            certificados y disponibles ahora mismo.
          </p>

          {/* Dos botones principales */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Link
              href="/necesito-ayuda"
              className="group bg-white text-animo-800 font-bold text-lg px-8 py-5 rounded-2xl
                         hover:bg-animo-50 transition-all duration-200 active:scale-95 shadow-xl
                         flex flex-col items-center gap-2"
            >
              <Heart className="w-8 h-8 text-animo-600 group-hover:scale-110 transition-transform" />
              <span>Necesito ayuda</span>
              <span className="text-sm font-normal text-slate-500">Hablar con un psicólogo</span>
            </Link>

            <Link
              href="/psicologo"
              className="group bg-animo-500 text-white font-bold text-lg px-8 py-5 rounded-2xl
                         hover:bg-animo-400 transition-all duration-200 active:scale-95 shadow-xl
                         flex flex-col items-center gap-2 border border-animo-400"
            >
              <Shield className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              <span>Soy psicólogo</span>
              <span className="text-sm font-normal text-animo-200">Quiero ser voluntario</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">¿Cómo funciona?</h2>
          <p className="text-center text-slate-500 mb-10">Simple, rápido y confidencial</p>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-animo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-animo-600">1</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Cuéntanos cómo te sientes</h3>
              <p className="text-sm text-slate-500">Un formulario sencillo, sin datos personales obligatorios</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-animo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-animo-600">2</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Te conectamos</h3>
              <p className="text-sm text-slate-500">Un psicólogo certificado acepta tu solicitud en minutos</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-animo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-animo-600">3</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Hablan juntos</h3>
              <p className="text-sm text-slate-500">Por videollamada, llamada o chat — tú decides</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modalidades */}
      <section className="bg-slate-50 py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-center text-slate-700 mb-8">
            Elige cómo quieres comunicarte
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Video, label: "Videollamada", desc: "Cara a cara por Jitsi Meet" },
              { icon: Phone, label: "Llamada", desc: "Solo audio, sin video" },
              { icon: MessageCircle, label: "Chat", desc: "Escrito, a tu ritmo" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card flex flex-col items-center text-center gap-2 py-8">
                <Icon className="w-8 h-8 text-animo-600" />
                <span className="font-semibold text-slate-800">{label}</span>
                <span className="text-sm text-slate-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer co-branding */}
      <footer className="bg-vikua-dark text-slate-400 py-10 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Logos en igual protagonismo */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
            {/* Kaimind */}
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/logos/kaimind.png"
                alt="Kaimind"
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <p className="text-slate-500 text-xs">Data Insight_</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-slate-500 text-2xl font-light">×</span>
              <span className="text-slate-600 text-xs uppercase tracking-widest">alianza</span>
            </div>

            {/* Vikua */}
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/logos/vikua.png"
                alt="Vikua"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <p className="text-slate-500 text-xs">Conocimiento para acertar</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6 text-center space-y-1">
            <p className="text-slate-300 text-sm">
              Ánimo es una iniciativa sin fines de lucro, en alianza con la
              <strong className="text-white"> Federación de Psicólogos de Venezuela</strong>.
            </p>
            <p className="text-slate-500 text-xs">
              Confidencial · Gratuito · Hecho con amor por Venezuela
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
