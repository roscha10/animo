import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ánimo — Apoyo Psicológico Gratuito para Venezuela",
  description:
    "Conectamos a venezolanos que necesitan apoyo emocional con psicólogos voluntarios certificados. Totalmente gratuito.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Ánimo — Apoyo Psicológico Gratuito",
    description: "Psicólogos voluntarios disponibles ahora para ayudarte.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
