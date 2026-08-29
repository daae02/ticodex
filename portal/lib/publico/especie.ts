import type { Enums } from "@/lib/database.types"
import type { Idioma } from "./i18n"

type FotoTipo = Enums<"especie_foto_tipo_enum">

/** Forma mínima de foto que necesitan el grid y la ficha. */
export interface FotoPublica {
  url: string
  tipo: FotoTipo
  es_principal: boolean
  orden: number
}

/**
 * Elige el valor del idioma pedido, devolviendo `null` (nunca string vacío
 * ni caída silenciosa al otro idioma) cuando falta — así la UI muestra
 * "(traducción pendiente)" explícitamente, igual que la ficha de la app
 * Flutter. Regla del producto: nada bilingüe se muestra con un idioma vacío
 * en silencio.
 */
export function textoBilingue(
  valorEs: string | null,
  valorEn: string | null,
  idioma: Idioma
): string | null {
  const valor = idioma === "es" ? valorEs : valorEn
  if (valor == null || valor.trim() === "") return null
  return valor
}

function ordenarPreferidas(a: FotoPublica, b: FotoPublica): number {
  if (a.es_principal !== b.es_principal) return a.es_principal ? -1 : 1
  return a.orden - b.orden
}

/** Miniatura del grid: la marcada `es_principal`; si ninguna, la primera por orden. */
export function fotoPrincipal(fotos: FotoPublica[]): FotoPublica | null {
  if (fotos.length === 0) return null
  return [...fotos].sort(ordenarPreferidas)[0]
}

/**
 * Foto para un slot/tipo concreto (adulto/juvenil/macho/hembra): la
 * `es_principal` dentro de ese tipo, luego la de menor `orden`. `null` si no
 * hay ninguna de ese tipo — el slot queda PENDIENTE, nunca se rellena con la
 * foto de otro tipo (regla del producto: los tipos no son intercambiables).
 */
export function fotoDeTipo(
  fotos: FotoPublica[],
  tipo: FotoTipo
): FotoPublica | null {
  const delTipo = fotos.filter((f) => f.tipo === tipo).sort(ordenarPreferidas)
  return delTipo[0] ?? null
}

/**
 * Slots de foto a mostrar en la ficha, según el mismo criterio que la app
 * Flutter (`fotoSlotsFor` en mobile/lib/models/especie.dart) y el gate de
 * publicación (PROYECTO.md §7):
 *  - `adulto` siempre.
 *  - `juvenil` solo si `tiene_diferencia_juvenil`.
 *  - `macho` + `hembra` solo si `tiene_dimorfismo_sexual`.
 */
export function slotsFoto(especie: {
  tiene_diferencia_juvenil: boolean
  tiene_dimorfismo_sexual: boolean
}): FotoTipo[] {
  const slots: FotoTipo[] = ["adulto"]
  if (especie.tiene_diferencia_juvenil) slots.push("juvenil")
  if (especie.tiene_dimorfismo_sexual) slots.push("macho", "hembra")
  return slots
}

/** Fotos sueltas de tipo `otro` (no encajan en un slot fijo). */
export function otrasFotos(fotos: FotoPublica[]): FotoPublica[] {
  return fotos.filter((f) => f.tipo === "otro").sort((a, b) => a.orden - b.orden)
}
