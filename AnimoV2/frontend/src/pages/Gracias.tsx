import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Heart, Phone } from "lucide-react";
import { api } from "../lib/api";

export default function Gracias() {
  const [params] = useSearchParams();
  const solicitudId = params.get("id");
  const [esperando, setEsperando] = useState(true);

  useEffect(() => {
    if (!solicitudId) return;
    const interval = setInterval(async () => {
      try {
        const data = await api.get(`/solicitud/${solicitudId}/estado`);
        if (data.estado === "en_sesion" && data.sesion_id) {
          window.location.href = `/sesion/${data.sesion_id}`;
        }
        if (data.estado !== "esperando") setEsperando(false);
      } catch {
        // sigue esperando
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [solicitudId]);

  return (
    <div className="min-h-screen bg-animo-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="w-20 h-20 bg-animo-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-animo-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Tu solicitud fue enviada</h1>

        {esperando ? (
          <>
            <p className="text-animo-300 text-lg mb-2">Un psicólogo está revisando tu caso.</p>
            <p className="text-animo-500 text-sm mb-8">Esta página te conectará automáticamente cuando alguien esté disponible.</p>
            <div className="flex items-center justify-center gap-2 text-animo-400 text-sm animate-pulse">
              <div className="w-2 h-2 bg-animo-500 rounded-full" />
              Buscando psicólogo disponible...
            </div>
          </>
        ) : (
          <p className="text-animo-300 text-lg mb-8">Fuiste muy valiente al pedir ayuda. Eso requiere coraje.</p>
        )}

        <div className="mt-12 bg-red-950/50 border border-red-900 rounded-2xl p-5">
          <p className="text-red-300 text-sm font-semibold mb-2">¿Necesitas ayuda inmediata?</p>
          <a href="tel:171" className="flex items-center justify-center gap-2 text-red-400 font-bold text-lg hover:text-red-300 transition-colors">
            <Phone className="w-5 h-5" /> Línea 171 — Gratuita 24/7
          </a>
        </div>

        <Link to="/" className="flex items-center justify-center gap-2 text-animo-500 hover:text-animo-400 text-sm mt-8 transition-colors">
          <Heart className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
