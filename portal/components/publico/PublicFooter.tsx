"use client"

import Link from "next/link"
import { TEXTOS } from "@/lib/publico/i18n"
import { useIdioma } from "./idioma"

/**
 * Pie de página de la superficie pública. Contiene el único acceso visible
 * al panel interno: un link discreto (texto chico, sin ícono ni emoji, sin
 * destacarlo) para que el equipo interno pueda entrar sin que sea el foco
 * de la pantalla para un visitante común.
 */
export function PublicFooter() {
  const { idioma } = useIdioma()

  return (
    <footer className="public-footer">
      <span>TICODEX — {TEXTOS[idioma].tagline}</span>
      <Link href="/login" className="public-footer-login">
        {TEXTOS[idioma].accesoEquipoInterno}
      </Link>
    </footer>
  )
}
