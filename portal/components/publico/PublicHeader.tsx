"use client"

import Link from "next/link"
import { TEXTOS } from "@/lib/publico/i18n"
import { useIdioma } from "./idioma"
import { LanguageToggle } from "./LanguageToggle"

/** Barra superior de la superficie pública: marca + tagline bilingüe + toggle
 * ES/EN. Reusa `.topnav` de globals.css (mismo chrome que el panel). */
export function PublicHeader() {
  const { idioma } = useIdioma()

  return (
    <header className="topnav">
      <Link
        href="/"
        className="marca pixel"
        style={{ textDecoration: "none", color: "var(--white)" }}
      >
        TICODEX
      </Link>
      <span
        className="aviso-texto"
        style={{ color: "var(--white)", opacity: 0.85 }}
      >
        {TEXTOS[idioma].tagline}
      </span>
      <LanguageToggle />
    </header>
  )
}
