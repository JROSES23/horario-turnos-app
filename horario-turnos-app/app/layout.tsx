import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Horarios Feb 2026",
  description: "Visualizador de turnos desde Excel"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
