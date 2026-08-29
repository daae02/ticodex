import "server-only"
import type { FuenteScraper, ResultadoFuente } from "../types"

/**
 * GBIF (Global Biodiversity Information Facility) — API pública de consulta
 * taxonómica (https://api.gbif.org), sin autenticación. GBIF agrega
 * registros de cientos de proveedores, cada uno con su propia licencia
 * (CC0, CC-BY, CC-BY-NC...). Decisión 2026-08-10 (PROYECTO.md §9):
 * **Ticodex es no comercial por ahora**, lo que cubre los registros
 * CC-BY-NC; para los que exigen atribución (CC-BY), el orquestador
 * (../orchestrator.ts) arma `especie.atribucion_fuente` nombrando esta
 * fuente cada vez que aporta un campo, y el panel la muestra cuando no es
 * null. Con ambos frentes cubiertos, `licenciaConfirmada: true`.
 */
async function buscarEspecie(nombreCientifico: string): Promise<ResultadoFuente | null> {
  const matchUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(nombreCientifico)}`
  const matchRes = await fetch(matchUrl)
  if (!matchRes.ok) return null

  const match = (await matchRes.json()) as { family?: string; usageKey?: number }
  if (!match.usageKey) return null

  async function vernaculo(idiomaIso3: string): Promise<string | undefined> {
    try {
      const vernRes = await fetch(
        `https://api.gbif.org/v1/species/${match.usageKey}/vernacularNames?language=${idiomaIso3}&limit=1`
      )
      if (!vernRes.ok) return undefined
      const vern = (await vernRes.json()) as { results?: { vernacularName?: string }[] }
      return vern.results?.[0]?.vernacularName
    } catch {
      // el nombre vernáculo es un extra — si falla, seguimos sin él
      return undefined
    }
  }

  // GBIF usa códigos ISO 639-2/B de 3 letras para `language` (eng, spa), no
  // los de 2 letras (en, es) que usa el resto del panel.
  const [nombreComunEn, nombreComunEs] = await Promise.all([
    vernaculo("eng"),
    vernaculo("spa"),
  ])

  return {
    fuente: "GBIF",
    nombreCientifico,
    campos: {
      familia: match.family,
      nombre_comun_en: nombreComunEn,
      nombre_comun_es: nombreComunEs,
    },
  }
}

export const fuenteGbif: FuenteScraper = {
  nombre: "GBIF",
  licenciaConfirmada: true,
  motivoLicencia:
    "No comercial (Ticodex, 2026-08-10) cubre los registros CC-BY-NC; los CC-BY quedan atribuidos vía especie.atribucion_fuente, que el orquestador completa con esta fuente cuando aporta datos.",
  buscarEspecie,
}
