import "server-only"
import type { FuenteScraper, ResultadoFuente } from "../types"

/**
 * Wikipedia — REST API pública (`/api/rest_v1/page/summary`), sin
 * autenticación. Se consulta es.wikipedia.org y en.wikipedia.org por
 * separado, con el mismo nombre científico, para traer descripcion_es y
 * descripcion_en como contenido NATIVO de cada edición (nunca se traduce a
 * mano un idioma a partir del otro — regla explícita del dispatch: preferir
 * siempre contenido nativo de la fuente sobre traducción). Si una edición no
 * tiene artículo para la especie, ese idioma queda sin dato; no bloquea al
 * otro. El texto de Wikipedia es CC-BY-SA 3.0 + GFDL: reutilizarlo exige
 * atribución visible y, si se modifica, compartirlo bajo la misma licencia.
 * Decisión 2026-08-10 (PROYECTO.md §9): se agregó
 * `especie.atribucion_fuente` (texto legible, ej. "Datos: Wikipedia
 * (CC-BY-SA)"), que el orquestador (../orchestrator.ts) completa cuando esta
 * fuente aporta un campo y que el panel muestra en la ficha cuando no es
 * null — con esa atribución visible resuelta, `licenciaConfirmada: true`.
 */
async function resumenWikipedia(
  dominio: "es" | "en",
  nombreCientifico: string
): Promise<string | undefined> {
  const url = `https://${dominio}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    nombreCientifico.replace(/ /g, "_")
  )}`
  try {
    const res = await fetch(url)
    if (!res.ok) return undefined
    const data = (await res.json()) as { extract?: string; type?: string }
    // "type": "disambiguation" u otras páginas sin resumen real de especie
    // no traen un extract útil de todas formas; el chequeo de abajo alcanza.
    return data.extract || undefined
  } catch {
    return undefined
  }
}

async function buscarEspecie(nombreCientifico: string): Promise<ResultadoFuente | null> {
  const [descripcionEs, descripcionEn] = await Promise.all([
    resumenWikipedia("es", nombreCientifico),
    resumenWikipedia("en", nombreCientifico),
  ])

  if (!descripcionEs && !descripcionEn) return null

  return {
    fuente: "Wikipedia especies",
    nombreCientifico,
    campos: {
      descripcion_es: descripcionEs,
      descripcion_en: descripcionEn,
    },
  }
}

export const fuenteWikipedia: FuenteScraper = {
  nombre: "Wikipedia especies",
  licenciaConfirmada: true,
  motivoLicencia:
    "CC-BY-SA + GFDL: exige atribución visible. Cubierto por especie.atribucion_fuente, que el orquestador completa con esta fuente y el panel muestra en la ficha.",
  buscarEspecie,
}
