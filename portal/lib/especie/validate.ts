import type { Tables } from "@/lib/database.types"

type CamposBilingues = Pick<
  Tables<"especie">,
  | "nombre_comun_es"
  | "nombre_comun_en"
  | "descripcion_es"
  | "descripcion_en"
  | "habitat_es"
  | "habitat_en"
  | "ubicacion_breve_es"
  | "ubicacion_breve_en"
>

const PARES_BILINGUES: [keyof CamposBilingues, keyof CamposBilingues, string][] = [
  ["nombre_comun_es", "nombre_comun_en", "nombre común"],
  ["descripcion_es", "descripcion_en", "descripción"],
  ["habitat_es", "habitat_en", "hábitat"],
  ["ubicacion_breve_es", "ubicacion_breve_en", "ubicación breve"],
]

function vacio(v: string | null | undefined) {
  return v == null || v.trim() === ""
}

interface ParBilingueFaltante {
  campoEs: keyof CamposBilingues
  campoEn: keyof CamposBilingues
  etiqueta: string
  faltaEs: boolean
  faltaEn: boolean
}

function paresBilinguesFaltantes(especie: CamposBilingues): ParBilingueFaltante[] {
  const resultado: ParBilingueFaltante[] = []
  for (const [campoEs, campoEn, etiqueta] of PARES_BILINGUES) {
    const es = vacio(especie[campoEs])
    const en = vacio(especie[campoEn])
    if (es !== en) {
      resultado.push({ campoEs, campoEn, etiqueta, faltaEs: es, faltaEn: en })
    } else if (es && en && campoEs === "nombre_comun_es") {
      // nombre común es el único par obligatorio en ambos idiomas siempre
      resultado.push({ campoEs, campoEn, etiqueta, faltaEs: true, faltaEn: true })
    }
  }
  return resultado
}

/**
 * Regla explícita del dispatch: "todo lo que publiques bilingüe debe tener
 * ambos campos (ES/EN) completos ... no dejes que se publique con un idioma
 * vacío en silencio". Se corre antes de permitir `estado_publicacion =
 * 'publicado'`, tanto en el formulario manual como al aprobar un candidato
 * de la cola de revisión.
 */
export function camposBilinguesFaltantes(especie: CamposBilingues): string[] {
  return paresBilinguesFaltantes(especie).map(({ etiqueta, faltaEs, faltaEn }) =>
    faltaEs && faltaEn
      ? `${etiqueta} (falta ES y EN)`
      : `${etiqueta} (${faltaEs ? "falta ES" : "falta EN"})`
  )
}

/**
 * Hermana de `camposBilinguesFaltantes` que devuelve los nombres de columna
 * puntuales que faltan (ej. `["descripcion_en"]`) en vez del texto ya
 * formateado — la usa EspecieForm.tsx para marcar el input/label exacto que
 * falta, no solo mostrar un mensaje general arriba del formulario.
 */
export function tokensBilinguesFaltantes(especie: CamposBilingues): string[] {
  const tokens: string[] = []
  for (const { campoEs, campoEn, faltaEs, faltaEn } of paresBilinguesFaltantes(especie)) {
    if (faltaEs) tokens.push(campoEs)
    if (faltaEn) tokens.push(campoEn)
  }
  return tokens
}

/**
 * Etiquetas legibles para los tokens que puede listar el trigger de base de
 * datos `validar_especie_completa_para_publicar` (PROYECTO.md §7/§9,
 * decisión 2026-08-10) en su mensaje de excepción, ej.:
 * `No se puede publicar "X": falta descripcion_en, foto_hembra`. Los nombres
 * de columna coinciden con `especie`/`especie_foto.tipo`; se normalizan antes
 * de buscarlos acá para tolerar variantes de formato (espacios, mayúsculas,
 * "foto de hembra" vs. "foto_hembra", etc.) sin depender del texto exacto.
 */
const ETIQUETAS_CAMPOS_GATE: Record<string, string> = {
  nombre_comun_es: "nombre común (ES)",
  nombre_comun_en: "nombre común (EN)",
  nombre_cientifico: "nombre científico",
  estado_conservacion: "estado de conservación (UICN)",
  descripcion_es: "descripción (ES)",
  descripcion_en: "descripción (EN)",
  habitat_es: "hábitat (ES)",
  habitat_en: "hábitat (EN)",
  ubicacion_breve_es: "ubicación breve (ES)",
  ubicacion_breve_en: "ubicación breve (EN)",
  foto_adulto: "foto — tipo adulto",
  foto_juvenil: "foto — tipo juvenil",
  foto_macho: "foto — tipo macho",
  foto_hembra: "foto — tipo hembra",
}

const RELLENO_GATE = new Set(["de", "del", "tipo", "la", "el", "los", "las"])

function normalizarTokenGate(token: string): string {
  const sinAcentos = token
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
  const piezas = sinAcentos
    .split(/[^a-z0-9]+/)
    .filter((p) => p && !RELLENO_GATE.has(p))
  return piezas.join("_")
}

function etiquetaCampoGate(tokenCrudo: string): string {
  const normalizado = normalizarTokenGate(tokenCrudo)
  return ETIQUETAS_CAMPOS_GATE[normalizado] ?? tokenCrudo.trim().replace(/_/g, " ")
}

function camposCrudosGate(mensajeCrudo: string): string[] | null {
  const match = mensajeCrudo.match(/no se puede publicar[^:]*:\s*falta[n]?\s*(.+)/i)
  if (!match) return null
  const campos = match[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  return campos.length > 0 ? campos : null
}

/**
 * Hermana de `interpretarErrorGatePublicacion`: devuelve los nombres de
 * columna normalizados que el trigger `validar_especie_completa_para_publicar`
 * reportó como faltantes (ej. `["descripcion_en", "foto_hembra"]`), en vez
 * del texto ya armado — EspecieForm.tsx la usa para marcar el input/label
 * puntual que falta. `foto_*` no tiene input propio en el formulario, así que
 * ese token queda sin marcar visualmente pero sigue apareciendo en el
 * mensaje de `interpretarErrorGatePublicacion`. Devuelve `[]` si el mensaje
 * no calza con el patrón del trigger.
 */
export function tokensGatePublicacion(mensajeCrudo: string | null | undefined): string[] {
  if (!mensajeCrudo) return []
  const camposCrudos = camposCrudosGate(mensajeCrudo)
  if (!camposCrudos) return []
  return camposCrudos.map(normalizarTokenGate)
}

/**
 * Traduce el mensaje crudo del trigger de publicación a texto accionable en
 * español para mostrar en el panel. Devuelve `null` si el mensaje no calza
 * con el patrón del trigger — en ese caso quien llama debe mostrar el error
 * original (u otro fallback), nunca inventar un mensaje sobre un error que no
 * es este. Nunca se muestra el mensaje crudo de Postgres al usuario cuando sí
 * matchea.
 */
export function interpretarErrorGatePublicacion(mensajeCrudo: string | null | undefined): string | null {
  if (!mensajeCrudo) return null
  const camposCrudos = camposCrudosGate(mensajeCrudo)
  if (!camposCrudos) return null

  const etiquetas = camposCrudos.map(etiquetaCampoGate)
  return (
    `No se puede publicar todavía — faltan datos obligatorios: ${etiquetas.join(", ")}. ` +
    `Completalos (o subí las fotos que falten) y volvé a intentar. "Guardar borrador" sí funciona aunque falten.`
  )
}
