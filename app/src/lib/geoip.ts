interface UbicacionIP {
  ciudad?: string;
  estado?: string;
  pais?: string;
  lat?: number;
  lon?: number;
}

export async function detectarUbicacionPorIP(ip: string): Promise<UbicacionIP> {
  try {
    // ip-api.com: gratis, sin API key, 45 req/min
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,regionName,country,lat,lon&lang=es`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (data.status === "success") {
      return {
        ciudad: data.city,
        estado: data.regionName,
        pais: data.country,
        lat: data.lat,
        lon: data.lon,
      };
    }
  } catch {
    // Si falla la detección, continuamos sin ubicación
  }
  return {};
}

export function obtenerIPReal(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "0.0.0.0";
}
