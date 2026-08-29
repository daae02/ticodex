import "server-only"
import type { FuenteScraper, ResultadoFuente } from "../types"
import type { Enums } from "@/lib/database.types"
import { ESTADO_CONSERVACION_VALUES } from "@/lib/csv/columns"

/**
 * iNaturalist — API pública (https://api.inaturalist.org/v1), sin
 * autenticación para lectura. Las fotos/observaciones llevan licencia
 * por-usuario (a menudo CC-BY-NC, que prohíbe uso comercial); el resumen de
 * texto que expone el endpoint de taxones (`wikipedia_summary`) viene, como
 * el nombre indica, de Wikipedia (CC-BY-SA + GFDL: exige atribución y, si se
 * edita, compartir bajo la misma licencia). Decisión 2026-08-10
 * (PROYECTO.md §9): **Ticodex es no comercial por ahora**, lo que cubre el
 * CC-BY-NC de las fotos; el texto CC-BY-SA queda atribuido vía
 * `especie.atribucion_fuente`, que el orquestador (../orchestrator.ts)
 * completa con esta fuente cuando aporta un campo, y que el panel muestra
 * cuando no es null. Con ambos frentes cubiertos, `licenciaConfirmada: true`.
 */

const CODIGOS_UICN_VALIDOS = new Set<string>(ESTADO_CONSERVACION_VALUES)

/** El `status` que expone iNaturalist para conservation_status normalmente
 * viene de la autoridad IUCN Red List con los mismos códigos que nuestro
 * enum (lc/nt/vu/en/cr/ew/ex/dd, en cualquier capitalización), pero también
 * puede venir de otras autoridades (ej. NatureServe, listas nacionales) con
 * códigos que no calzan con UICN — en ese caso no mapeamos nada, en vez de
 * adivinar (regla explícita del dispatch). */
function mapearEstadoConservacion(
  status?: string | null
): Enums<"estado_conservacion_enum"> | undefined {
  if (!status) return undefined
  const codigo = status.trim().toUpperCase()
  return CODIGOS_UICN_VALIDOS.has(codigo)
    ? (codigo as Enums<"estado_conservacion_enum">)
    : undefined
}

interface FotoInaturalist {
  medium_url?: string
  url?: string
  license_code?: string | null
  attribution?: string
}

/** No comercial (PROYECTO.md §9) habilita CC-BY-NC y afines — la única
 * licencia que nunca se acepta es "todos los derechos reservados", que en la
 * API de iNaturalist se expresa como `license_code: null`/ausente (foto sin
 * licencia explícita) o, más raro, el literal `"all-rights-reserved"`. */
function licenciaPermiteRedistribucionNoComercial(licenseCode?: string | null): boolean {
  if (!licenseCode) return false
  return licenseCode.toLowerCase() !== "all-rights-reserved"
}

function fotoCandidata(foto?: FotoInaturalist | null): {
  url?: string
  atribucion?: string
} {
  if (!foto || !licenciaPermiteRedistribucionNoComercial(foto.license_code)) return {}
  const url = foto.medium_url ?? foto.url
  if (!url) return {}
  return { url, atribucion: foto.attribution }
}

async function buscarEspecie(nombreCientifico: string): Promise<ResultadoFuente | null> {
  const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(
    nombreCientifico
  )}&rank=species&per_page=1`
  const res = await fetch(url)
  if (!res.ok) return null

  const data = (await res.json()) as {
    results?: {
      preferred_common_name?: string
      wikipedia_summary?: string
      conservation_status?: { status?: string; iucn_status?: string } | null
      default_photo?: FotoInaturalist | null
      taxon_photos?: { photo?: FotoInaturalist }[]
    }[]
  }
  const taxon = data.results?.[0]
  if (!taxon) return null

  const estadoConservacion = mapearEstadoConservacion(
    taxon.conservation_status?.status ?? taxon.conservation_status?.iucn_status
  )

  // Preferimos default_photo (la que iNaturalist marca como representativa
  // del taxón); si no tiene licencia redistribuible, probamos la primera de
  // taxon_photos que sí la tenga, en vez de descartar la especie entera.
  let candidata = fotoCandidata(taxon.default_photo)
  if (!candidata.url) {
    const primeraConLicencia = taxon.taxon_photos?.find((tp) =>
      licenciaPermiteRedistribucionNoComercial(tp.photo?.license_code)
    )
    candidata = fotoCandidata(primeraConLicencia?.photo)
  }

  return {
    fuente: "iNaturalist",
    nombreCientifico,
    campos: {
      nombre_comun_en: taxon.preferred_common_name,
      descripcion_en: taxon.wikipedia_summary,
      estado_conservacion: estadoConservacion,
      fotoAdultoCandidataUrl: candidata.url,
      fotoAdultoCandidataAtribucion: candidata.atribucion,
    },
  }
}

export const fuenteInaturalist: FuenteScraper = {
  nombre: "iNaturalist",
  licenciaConfirmada: true,
  motivoLicencia:
    "No comercial (Ticodex, 2026-08-10) cubre las fotos CC-BY-NC; el resumen de texto (CC-BY-SA vía Wikipedia) queda atribuido por especie.atribucion_fuente.",
  buscarEspecie,
}
