"use client"

import Link from "next/link"
import type { Enums } from "@/lib/database.types"
import { TEXTOS } from "@/lib/publico/i18n"
import {
  fotoPrincipal,
  textoBilingue,
  type FotoPublica,
} from "@/lib/publico/especie"
import { PixelIcon } from "@/components/PixelIcon"
import { useIdioma } from "./idioma"
import { ConservationBadge } from "./ConservationBadge"

export interface EspecieGrid {
  id: string
  nombre_comun_es: string
  nombre_comun_en: string | null
  nombre_cientifico: string
  estado_conservacion: Enums<"estado_conservacion_enum"> | null
  especie_foto: FotoPublica[]
}

/** Grid del catálogo público. Nombre común según el toggle ES/EN; si falta
 * ese idioma se muestra "(traducción pendiente)" en vez de caer al otro. */
export function CatalogoGrid({ especies }: { especies: EspecieGrid[] }) {
  const { idioma } = useIdioma()

  if (especies.length === 0) {
    return (
      <div className="tarjeta cream">
        <p className="aviso-texto">{TEXTOS[idioma].catalogoVacio}</p>
      </div>
    )
  }

  return (
    <div className="catalogo-grid">
      {especies.map((especie, i) => {
        const nombre = textoBilingue(
          especie.nombre_comun_es,
          especie.nombre_comun_en,
          idioma
        )
        const foto = fotoPrincipal(especie.especie_foto ?? [])
        return (
          <Link
            key={especie.id}
            href={`/especie/${especie.id}`}
            className={`especie-card ${i % 2 === 0 ? "cream" : "lavender"}`}
          >
            <span className="especie-card-thumb">
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto.url} alt={nombre ?? especie.nombre_cientifico} />
              ) : (
                <PixelIcon name="photo" size={28} />
              )}
            </span>
            <span
              className="especie-card-nombre"
              style={{ fontStyle: nombre ? "normal" : "italic" }}
            >
              {nombre ?? TEXTOS[idioma].traduccionPendiente}
            </span>
            <span className="especie-card-cientifico">
              <i>{especie.nombre_cientifico}</i>
            </span>
            <ConservationBadge
              estado={especie.estado_conservacion}
              idioma={idioma}
            />
          </Link>
        )
      })}
    </div>
  )
}
