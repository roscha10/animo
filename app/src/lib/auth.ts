import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "animo_session";

export async function crearToken(psicologoId: string): Promise<string> {
  return await new SignJWT({ psicologoId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verificarToken(
  token: string
): Promise<{ psicologoId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { psicologoId: string };
  } catch {
    return null;
  }
}

export async function obtenerSesionActual(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verificarToken(token);
  return payload?.psicologoId ?? null;
}

export { COOKIE_NAME };
