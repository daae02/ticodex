import "server-only"

/**
 * Búsqueda de candidatos para el flujo "buscar especie -> elegir cuál es ->
 * traer datos completos" (dispatch 2026-08-10, reemplaza la lista fija
 * anterior de ./config.ts). El scraper NUNCA elige una especie por su
 * cuenta: esta función solo arma una lista corta de sugerencias a partir de
 * lo que el usuario escribió (nombre común ES/EN o nombre científico), y es
 * el usuario quien confirma cuál de esas sugerencias correr contra
 * ../orchestrator.ts (ver app/(panel)/fuentes/actions.ts).
 *
 * No hay ninguna API key de un motor de búsqueda general (Google/Bing) en
 * este proyecto, ni se agrega una — regla explícita del dispatch. En vez de
 * eso se usan las capacidades de búsqueda que ya exponen las fuentes
 * biodiversas configuradas:
 *
 * - iNaturalist `GET /v1/taxa?q=<texto>&locale=<es|en>` indexa nombres
 *   comunes por idioma (no solo nombre científico), y es la fuente principal
 *   de esta búsqueda. Se consulta en paralelo con locale=es y locale=en para
 *   poder mostrar ambos nombres comunes del mismo taxón cuando existen. Si
 *   NINGUNA de las dos encuentra nada (típicamente porque el texto es un
 *   nombre científico sin traducción indexada), se reintenta sin `locale`
 *   (iNaturalist igual matchea por nombre científico sin ese parámetro).
 * - GBIF `GET /v1/species/search?q=<texto>` se usa como complemento (no
 *   reemplazo): agrega nombres científicos que iNaturalist no haya
 *   devuelto. GBIF no expone de forma confiable nombre común/foto en este
 *   endpoint, así que esas entradas aparecen solo con nombre científico —
 *   igual sirve para que el usuario las elija a mano.
 *
 * Restringido a rank "species" en ambas fuentes: el proyecto solo maneja
 * fichas de especie individual (PROYECTO.md), no géneros ni familias.
 */

export interface CandidatoBusquedaEspecie {
  nombreCientifico: string
  nombreComunEs?: string
  nombreComunEn?: string
  fotoUrl?: string
}

interface TaxonInaturalist {
  id: number
  name?: string
  preferred_common_name?: string
  default_photo?: { square_url?: string; medium_url?: string } | null
}

async function buscarTaxonesInaturalist(
  query: string,
  locale?: "es" | "en"
): Promise<TaxonInaturalist[]> {
  const params = new URLSearchParams({ q: query, rank: "species", per_page: "8" })
  if (locale) params.set("locale", locale)
  try {
    const res = await fetch(`https://api.inaturalist.org/v1/taxa?${params.toString()}`)
    if (!res.ok) return []
    const data = (await res.json()) as { results?: TaxonInaturalist[] }
    return data.results ?? []
  } catch {
    // La búsqueda es best-effort contra una API externa — si falla, se
    // intenta con las otras fuentes/idiomas en vez de romper la búsqueda.
    return []
  }
}

interface ResultadoGbif {
  scientificName?: string
  canonicalName?: string
  rank?: string
}

async function buscarGbif(query: string): Promise<ResultadoGbif[]> {
  try {
    const url = `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(
      query
    )}&rank=SPECIES&limit=8`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = (await res.json()) as { results?: ResultadoGbif[] }
    return data.results ?? []
  } catch {
    return []
  }
}

function mejorFoto(taxon: TaxonInaturalist): string | undefined {
  return taxon.default_photo?.square_url ?? taxon.default_photo?.medium_url ?? undefined
}

export async function buscarCandidatosEspecie(
  query: string
): Promise<CandidatoBusquedaEspecie[]> {
  const texto = query.trim()
  if (!texto) return []

  const [porEs, porEn] = await Promise.all([
    buscarTaxonesInaturalist(texto, "es"),
    buscarTaxonesInaturalist(texto, "en"),
  ])

  const sinLocale =
    porEs.length === 0 && porEn.length === 0
      ? await buscarTaxonesInaturalist(texto)
      : []

  const porId = new Map<number, CandidatoBusquedaEspecie>()
  for (const taxon of [...porEs, ...sinLocale]) {
    if (!taxon.name) continue
    porId.set(taxon.id, {
      nombreCientifico: taxon.name,
      nombreComunEs: taxon.preferred_common_name,
      fotoUrl: mejorFoto(taxon),
    })
  }
  for (const taxon of porEn) {
    if (!taxon.name) continue
    const existente = porId.get(taxon.id)
    if (existente) {
      existente.nombreComunEn = taxon.preferred_common_name
      existente.fotoUrl = existente.fotoUrl ?? mejorFoto(taxon)
    } else {
      porId.set(taxon.id, {
        nombreCientifico: taxon.name,
        nombreComunEn: taxon.preferred_common_name,
        fotoUrl: mejorFoto(taxon),
      })
    }
  }

  const candidatos = [...porId.values()]

  const nombresYaListados = new Set(candidatos.map((c) => c.nombreCientifico.toLowerCase()))
  const gbif = await buscarGbif(texto)
  for (const r of gbif) {
    const nombre = r.canonicalName ?? r.scientificName
    if (!nombre || nombresYaListados.has(nombre.toLowerCase())) continue
    nombresYaListados.add(nombre.toLowerCase())
    candidatos.push({ nombreCientifico: nombre })
  }

  return candidatos.slice(0, 10)
}
