"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Heart, LogOut, Users, CheckCircle, Clock,
  Video, Phone, MessageCircle, AlertTriangle, RefreshCw
} from "lucide-react";

type EstadoPsicologo = "disponible" | "en_sesion" | "en_espera" | "no_disponible" | "offline";

interface Solicitud {
  id: string;
  creadoEn: string;
  nombreAnonimo?: string;
  edad?: number;
  ciudad?: string;
  estadoVe?: string;
  sintomas: string[];
  descripcion?: string;
  nivelCrisis: number;
  esEmergencia: boolean;
  contactoPreferido: string;
  estadoSolicitud: string;
}

interface DatosPsicologo {
  id: string;
  nombre: string;
  estadoActual: EstadoPsicologo;
  totalSesiones: number;
}

const ESTADOS: { id: EstadoPsicologo; label: string; color: string; dot: string; style?: React.CSSProperties }[] = [
  { id: "disponible",    label: "Disponible ahora",     color: "text-white",   dot: "bg-green-400", style: { backgroundColor: "#26D07C" } },
  { id: "en_espera",     label: "En espera de llamado", color: "text-white",   dot: "bg-blue-300",  style: { backgroundColor: "#38BEFC" } },
  { id: "no_disponible", label: "No disponible",        color: "bg-slate-400 text-white", dot: "bg-slate-300" },
];

const CONTACTO_ICON: Record<string, typeof Video> = {
  video: Video,
  llamada: Phone,
  chat: MessageCircle,
};

export default function DashboardPsicologo() {
  const router = useRouter();
  const [psicologo, setPsicologo] = useState<DatosPsicologo | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);
  const [aceptando, setAceptando] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      const [resPsi, resSol] = await Promise.all([
        fetch("/api/psicologo/yo"),
        fetch("/api/psicologo/solicitudes"),
      ]);
      if (resPsi.status === 401) {
        router.push("/psicologo");
        return;
      }
      if (resPsi.ok) setPsicologo(await resPsi.json());
      if (resSol.ok) setSolicitudes(await resSol.json());
    } finally {
      setCargando(false);
    }
  }, [router]);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 15000); // refresca cada 15s
    return () => clearInterval(interval);
  }, [cargarDatos]);

  async function cambiarEstado(nuevoEstado: EstadoPsicologo) {
    setActualizandoEstado(true);
    try {
      await fetch("/api/psicologo/estado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      setPsicologo((p) => p ? { ...p, estadoActual: nuevoEstado } : p);
    } finally {
      setActualizandoEstado(false);
    }
  }

  async function aceptarSolicitud(solicitudId: string, tipo: string) {
    setAceptando(solicitudId);
    try {
      const res = await fetch("/api/sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitudId, tipo }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/sesion/${data.id}`);
    } finally {
      setAceptando(null);
    }
  }

  async function cerrarSesion() {
    await fetch("/api/psicologo/logout", { method: "POST" });
    router.push("/psicologo");
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-animo-600 animate-spin" />
      </div>
    );
  }

  const estadoActual = ESTADOS.find((e) => e.id === psicologo?.estadoActual);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-animo-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="text-white w-5 h-5 fill-white" />
          <span className="text-white font-bold text-lg">Ánimo</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-animo-200 text-sm hidden sm:block">
            {psicologo?.nombre}
          </span>
          <button onClick={cerrarSesion} className="text-animo-200 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Tarjeta de estado */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Hola, {psicologo?.nombre?.split(" ")[0]}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2.5 h-2.5 rounded-full ${estadoActual?.dot ?? "bg-slate-300"} animate-pulse`} />
                <span className="text-sm text-slate-600">{estadoActual?.label ?? "Desconectado"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="w-4 h-4" />
              <span>{psicologo?.totalSesiones} sesiones completadas</span>
            </div>
          </div>

          {/* Selector de estado */}
          <div className="mt-5">
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
              Cambiar mi estado
            </p>
            <div className="flex flex-wrap gap-2">
              {ESTADOS.map((est) => (
                <button
                  key={est.id}
                  onClick={() => cambiarEstado(est.id)}
                  disabled={actualizandoEstado}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    psicologo?.estadoActual === est.id
                      ? `${est.color} shadow-md`
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  style={psicologo?.estadoActual === est.id ? est.style : undefined}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    psicologo?.estadoActual === est.id ? "bg-white" : est.dot
                  }`} />
                  {est.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Solicitudes pendientes
              {solicitudes.length > 0 && (
                <span className="ml-2 bg-animo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {solicitudes.length}
                </span>
              )}
            </h2>
            <button onClick={cargarDatos} className="text-slate-400 hover:text-animo-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {solicitudes.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Sin solicitudes pendientes</p>
              <p className="text-slate-400 text-sm mt-1">
                Cuando alguien pida ayuda, aparecerá aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitudes.map((sol) => {
                const IconoContacto = CONTACTO_ICON[sol.contactoPreferido] ?? Video;
                const tiempoEspera = Math.round(
                  (Date.now() - new Date(sol.creadoEn).getTime()) / 60000
                );

                return (
                  <div
                    key={sol.id}
                    className={`card border-l-4 ${
                      sol.esEmergencia ? "border-l-red-500 bg-red-50/30" : "border-l-animo-400"
                    }`}
                  >
                    {/* Cabecera */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {sol.esEmergencia && (
                          <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            URGENTE
                          </span>
                        )}
                        <span className="text-sm font-medium text-slate-700">
                          {sol.nombreAnonimo || "Anónimo"}
                          {sol.edad && `, ${sol.edad} años`}
                        </span>
                        {(sol.ciudad || sol.estadoVe) && (
                          <span className="text-xs text-slate-400">
                            📍 {[sol.ciudad, sol.estadoVe].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{tiempoEspera}m</span>
                      </div>
                    </div>

                    {/* Síntomas */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {sol.sintomas.map((s) => (
                        <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Nivel de crisis */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-slate-500">Intensidad:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className={`w-4 h-2 rounded-full ${
                              n <= sol.nivelCrisis
                                ? sol.nivelCrisis >= 4
                                  ? "bg-red-400"
                                  : "bg-animo-400"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">{sol.nivelCrisis}/5</span>
                    </div>

                    {sol.descripcion && (
                      <p className="text-sm text-slate-600 mb-4 italic bg-slate-50 rounded-lg p-3">
                        "{sol.descripcion}"
                      </p>
                    )}

                    {/* Acción */}
                    <button
                      onClick={() => aceptarSolicitud(sol.id, sol.contactoPreferido)}
                      disabled={aceptando === sol.id || psicologo?.estadoActual !== "disponible"}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                        psicologo?.estadoActual !== "disponible"
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : sol.esEmergencia
                          ? "bg-red-600 hover:bg-red-700 text-white active:scale-95"
                          : "bg-animo-600 hover:bg-animo-700 text-white active:scale-95"
                      }`}
                    >
                      <IconoContacto className="w-4 h-4" />
                      {aceptando === sol.id
                        ? "Iniciando sesión..."
                        : psicologo?.estadoActual !== "disponible"
                        ? "Cambia tu estado a Disponible para aceptar"
                        : `Aceptar (${sol.contactoPreferido})`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
