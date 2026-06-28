import Link from "next/link";
import { Heart, CheckCircle } from "lucide-react";

export default function GraciasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-animo-950 to-animo-700 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex items-center justify-center gap-2">
          <Heart className="text-white w-6 h-6 fill-white" />
          <span className="text-white text-xl font-bold">Ánimo</span>
        </div>

        <div className="space-y-4">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
          <h1 className="text-3xl font-extrabold text-white">
            Sesión completada
          </h1>
          <p className="text-animo-200 text-lg leading-relaxed">
            Gracias por dar este paso.<br />
            <strong className="text-white">Pedir ayuda es un acto de valentía.</strong>
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 text-left space-y-3 border border-white/10">
          <p className="text-white font-semibold text-sm uppercase tracking-wide mb-3">Recuerda</p>
          <p className="text-animo-200 text-sm">
            🌱 El bienestar emocional es un proceso. Está bien pedir ayuda cuando la necesites.
          </p>
          <p className="text-animo-200 text-sm">
            📞 Si en algún momento sientes que estás en crisis, llama a la línea de emergencias <strong className="text-white">171</strong>.
          </p>
          <p className="text-animo-200 text-sm">
            💙 Puedes volver a Ánimo cuando lo necesites, sin registro, sin costo.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-white text-animo-800 font-bold px-8 py-3 rounded-2xl hover:bg-animo-50 transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
