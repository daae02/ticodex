"use client"

import { IDIOMAS } from "@/lib/publico/i18n"
import { useIdioma } from "./idioma"

/**
 * Toggle segmentado "ES | EN" de la barra superior pública. Estilo pixel
 * (sin curvas), opción activa en verde primario — mismo patrón que
 * `LanguageToggle` de la app Flutter.
 */
export function LanguageToggle() {
  const { idioma, setIdioma } = useIdioma()

  return (
    <div className="lang-toggle" role="group" aria-label="Idioma / Language">
      {IDIOMAS.map((opcion) => (
        <button
          key={opcion}
          type="button"
          className={`lang-toggle-opcion pixel${
            idioma === opcion ? " activo" : ""
          }`}
          aria-pressed={idioma === opcion}
          onClick={() => setIdioma(opcion)}
        >
          {opcion.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
