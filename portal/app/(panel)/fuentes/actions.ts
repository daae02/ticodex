"use server"

import { after } from "next/server"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/supabase/server"
import { runScraper } from "@/lib/scraper/orchestrator"
import { buscarCandidatosEspecie, type CandidatoBusquedaEspecie } from "@/lib/scraper/busqueda"

export interface EstadoBusqueda {
  query?: string
  candidatos: CandidatoBusquedaEspecie[]
  error?: string
}

/**
 * Busca candidatos contra iNaturalist/GBIF (ver lib/scraper/busqueda.ts) a
 * partir de lo que el usuario escribió — nombre común ES/EN o científico.
 * Nunca resuelve la ambigüedad sola: siempre devuelve una lista para que el
 * usuario elija, aunque haya un único resultado.
 */
export async function buscarCandidatosAction(
  _prevState: EstadoBusqueda,
  formData: FormData
): Promise<EstadoBusqueda> {
  try {
    await requireUser()
  } catch (e) {
    return { candidatos: [], error: (e as Error).message }
  }

  const query = String(formData.get("q") ?? "").trim()
  if (!query) {
    return { candidatos: [], error: "Escribí un nombre para buscar." }
  }

  try {
    const candidatos = await buscarCandidatosEspecie(query)
    return { query, candidatos }
  } catch (e) {
    return { query, candidatos: [], error: (e as Error).message }
  }
}

export interface EstadoScraper {
  lanzado?: boolean
  nombreCientifico?: string
  error?: string
}

/**
 * Corre el scraper para EL nombre científico que el usuario confirmó a
 * partir de los candidatos de `buscarCandidatosAction` — nunca para una
 * lista precargada (esa lista fija ya no existe, ver lib/scraper/config.ts).
 * Usa `after()` (Next 16) para que la corrida real pase DESPUÉS de responder
 * al cliente: confirmar un candidato no bloquea el panel — regla explícita
 * del dispatch ("El scraper corre en segundo plano, no bloquea el panel").
 */
export async function dispararScraperAction(
  _prevState: EstadoScraper,
  formData: FormData
): Promise<EstadoScraper> {
  try {
    await requireUser()
  } catch (e) {
    return { error: (e as Error).message }
  }

  const nombreCientifico = String(formData.get("nombre_cientifico") ?? "").trim()
  if (!nombreCientifico) {
    return { error: "Falta el nombre científico del candidato confirmado." }
  }

  after(async () => {
    try {
      await runScraper(nombreCientifico)
    } finally {
      // Se corre después de responder, así que esto no afecta la respuesta ya
      // enviada — pero sí la próxima vez que el usuario navegue a estas
      // páginas (revalidatePath invalida el cache del router).
      revalidatePath("/especies")
      revalidatePath("/revision")
      revalidatePath("/fuentes")
    }
  })

  return { lanzado: true, nombreCientifico }
}
