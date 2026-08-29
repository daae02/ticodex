import type { Enums } from "@/lib/database.types"
import {
  IUCN_BADGE_CLASS,
  IUCN_LABELS,
  TEXTOS,
  type Idioma,
} from "@/lib/publico/i18n"

type EstadoConservacion = Enums<"estado_conservacion_enum">

/**
 * Badge del estado de conservación UICN. El código (LC/NT/VU/…) no se
 * traduce; con `mostrarEtiqueta` se agrega además el texto largo traducido
 * (para la ficha). Sin dato → chip neutro "sin dato", no una alerta.
 */
export function ConservationBadge({
  estado,
  idioma,
  mostrarEtiqueta = false,
}: {
  estado: EstadoConservacion | null
  idioma: Idioma
  mostrarEtiqueta?: boolean
}) {
  if (estado == null) {
    return (
      <span className="badge badge-dd">
        {TEXTOS[idioma].sinDatoConservacion.toUpperCase()}
      </span>
    )
  }

  return (
    <span
      className="fila"
      style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}
    >
      <span className={`badge ${IUCN_BADGE_CLASS[estado]}`}>{estado}</span>
      {mostrarEtiqueta && (
        <span className="aviso-texto">
          {TEXTOS[idioma].estadoConservacion}: {IUCN_LABELS[idioma][estado]}
        </span>
      )}
    </span>
  )
}
