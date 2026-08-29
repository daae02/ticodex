export interface CampoDiff {
  actual: string | null
  propuesto: string
}

const CAMPOS_MANUALES_SIEMPRE_VISIBLES = [
  "habitat_es",
  "habitat_en",
  "ubicacion_breve_es",
  "ubicacion_breve_en",
] as const

export type CamposManuales = Record<
  (typeof CAMPOS_MANUALES_SIEMPRE_VISIBLES)[number],
  string | null
>

/**
 * Ninguna fuente del scraper propone hábitat ni ubicación breve — son
 * puramente manuales (PROYECTO.md), así que nunca aparecen en
 * `campos_propuestos`. Se agregan igual al diff que arma CandidatoCard.tsx
 * para que el equipo pueda completarlos ahí mismo al revisar en vez de tener
 * que ir después a editar la especie (ver dispatch bug #4). Si el candidato
 * es una `actualizacion` de una especie ya existente, se siembran con el
 * valor actual de esa especie (no en blanco) para no pisar con vacío un dato
 * ya cargado si el usuario deja el campo sin tocar al aprobar; para `nuevo`
 * no hay especie todavía, así que quedan vacíos — eso sí es lo esperado.
 */
export function conCamposManualesSiempreVisibles(
  diff: Record<string, CampoDiff>,
  especieActual: CamposManuales | null
): Record<string, CampoDiff> {
  const resultado = { ...diff }
  for (const campo of CAMPOS_MANUALES_SIEMPRE_VISIBLES) {
    if (campo in resultado) continue
    const actual = especieActual?.[campo] ?? null
    resultado[campo] = { actual, propuesto: actual ?? "" }
  }
  return resultado
}

/**
 * Parsea `candidato_especie.campos_propuestos` (jsonb) al formato que arma el
 * orquestador (lib/scraper/orchestrator.ts): por campo, valor actual (null si
 * el candidato es `nuevo`, porque la especie todavía no existe) vs.
 * propuesto. Nunca confiamos ciegamente en la forma del JSON — si una entrada
 * no calza con el contrato se descarta en vez de romper el render de la cola
 * de revisión.
 */
export function parseCamposPropuestos(json: unknown): Record<string, CampoDiff> {
  if (json == null || typeof json !== "object" || Array.isArray(json)) return {}

  const resultado: Record<string, CampoDiff> = {}
  for (const [campo, valor] of Object.entries(json as Record<string, unknown>)) {
    if (
      valor != null &&
      typeof valor === "object" &&
      "propuesto" in valor &&
      typeof (valor as { propuesto: unknown }).propuesto === "string"
    ) {
      const actualRaw = (valor as { actual?: unknown }).actual
      resultado[campo] = {
        propuesto: (valor as { propuesto: string }).propuesto,
        actual: typeof actualRaw === "string" ? actualRaw : null,
      }
    }
  }
  return resultado
}
