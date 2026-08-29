import type { Metadata } from "next"
import { PublicHeader } from "@/components/publico/PublicHeader"
import { PublicFooter } from "@/components/publico/PublicFooter"

export const metadata: Metadata = {
  title: "Ticodex — Fauna de Costa Rica",
  description:
    "Catálogo de fauna de Costa Rica: especies, fotos por tipo, sonido, " +
    "descripción, hábitat y estado de conservación. Bilingüe ES/EN.",
}

/**
 * Layout de la superficie pública del portal (fuera del grupo `(panel)`):
 * catálogo real de especies publicadas, sin login. Ver PROYECTO.md §2.1 y
 * la decisión 2026-08-28 (§9). El toggle ES/EN (store en
 * components/publico/idioma.ts) es global a grid y ficha.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      <PublicHeader />
      <main className="contenido" style={{ flex: 1, width: "100%" }}>
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
