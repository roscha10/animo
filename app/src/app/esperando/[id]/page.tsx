"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, CheckCircle, Clock } from "lucide-react";

interface EstadoSolicitud {
  estadoSolicitud: string;
  sesionId?: string;
  psicologoNombre?: string;
}

export default function Esperando({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoSolicitud | null>(null);
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function verificar() {
      try {
        const res = await fetch(`/api/solicitud/${id}`);
        if (!res.ok) return;
        const data: EstadoSolicitud = await res.json();
        setEstado(data);
        setIntentos((i) => i + 1);

        if (data.estadoSolicitud === "en_sesion" && data.sesionId) {
          clearInterval(interval);
          router.push(`/sesion/${data.sesionId}`);
        }
      } catch {
        // red inestable, continuar intentando
      }
    }

    verificar();
    interval = setInterval(verificar, 10000); // cada 10 segundos
    return () => clearInterval(interval);
  }, [id, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-animo-950 to-animo-700 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <Heart className="text-white w-6 h-6 fill-white" />
          <span className="text-white text-xl font-bold">Ánimo</span>
        </div>

        {estado?.estadoSolicitud === "en_sesion" ? (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">¡Te conectamos ahora!</h2>
            <p className="text-animo-200">Entrando a la sesión...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Animación de espera */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-animo-400/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-animo-300/50 animate-ping" style={{ animationDelay: "0.3s" }} />
              <div className="relative w-24 h-24 rounded-full bg-animo-600/50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Buscando tu psicólogo
              </h2>
              <p className="text-animo-200 leading-relaxed">
                Estamos conectándote con un profesional disponible.
                Esto suele tardar menos de 5 minutos.
              </p>
            </div>

            {/* Estado */}
            <div className="bg-white/10 rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white text-sm">Tu solicitud fue recibida</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-animo-200 text-sm">Buscando psicólogo disponible...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-slate-500 rounded-full" />
                <span className="text-animo-400 text-sm">Inicio de sesión</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-animo-300 text-sm">
              <Clock className="w-4 h-4" />
              <span>Verificando cada 10 segundos... ({intentos} verificaciones)</span>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-animo-200 text-sm">
                Mientras esperas, respira profundo.{" "}
                <strong className="text-white">Dar este paso fue muy valiente.</strong>{" "}
                Hay alguien aquí para escucharte.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
