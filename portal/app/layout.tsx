import type { Metadata } from "next"
import { Press_Start_2P } from "next/font/google"
import "./globals.css"

// Tipografía de títulos/labels/botones (DISENO.md). Solo mayúsculas y frases
// cortas — nunca párrafos, es ilegible a tamaño de cuerpo.
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ticodex Panel",
  description: "Panel de carga interno — Ticodex",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={pressStart2P.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
