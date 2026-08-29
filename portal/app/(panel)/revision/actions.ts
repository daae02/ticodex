"use server"

import { revalidatePath } from "next/cache"
import { requireUser, createSupabaseServerClient } from "@/lib/supabase/server"
import {
  camposBilinguesFaltantes,
  interpretarErrorGatePublicacion,
} from "@/lib/especie/validate"
import { CLASE_TAXONOMICA_VALUES, ESTADO_CONSERVACION_VALUES } from "@/lib/csv/columns"
import type { Enums, TablesInsert, TablesUpdate, Tables } from "@/lib/database.types"

export interface EstadoCandidato {
  error?: string
  ok?: boolean
}

/** Campos que puede proponer el scraper (lib/scraper/types.ts) más
 * nombre_cientifico (identifica a la especie) y habitat_es/en,
 * ubicacion_breve_es/en — estos últimos cuatro ninguna fuente del scraper
 * los provee, pero se ofrecen igual como editables acá para que el equipo
 * los complete a mano en el momento de revisar en vez de tener que ir
 * después al formulario de la especie (ver
 * lib/scraper/diff.ts#conCamposManualesSiempreVisibles). Editar acá antes de
 * aprobar reemplaza el valor propuesto — es la forma de "aprobar editando"
 * que pide el dispatch. No incluye la foto candidata informativa
 * (foto_adulto_candidata_url/atribucion, ver CandidatoCard.tsx) — esa nunca
 * se aplica sola, se sube a mano si sirve. */
const CAMPOS_EDITABLES = [
  "nombre_comun_es",
  "nombre_comun_en",
  "nombre_cientifico",
  "clase_taxonomica",
  "familia",
  "descripcion_es",
  "descripcion_en",
  "habitat_es",
  "habitat_en",
  "ubicacion_breve_es",
  "ubicacion_breve_en",
  "estado_conservacion",
  "atribucion_fuente",
] as const

function leerValoresEditados(formData: FormData): Record<string, string | null> {
  const valores: Record<string, string | null> = {}
  for (const campo of CAMPOS_EDITABLES) {
    if (formData.has(`campo__${campo}`)) {
      const raw = String(formData.get(`campo__${campo}`) ?? "").trim()
      valores[campo] = raw === "" ? null : raw
    }
  }
  return valores
}

/**
 * Aprueba (creando o actualizando `especie`) o descarta un candidato de
 * `candidato_especie`, uno por vez — nunca en lote (PROYECTO.md §2/§8: "uno
 * por uno"). El diff mostrado en /revision ya viene con los valores
 * propuestos precargados en inputs editables; lo que llega acá en
 * `campo__<nombre>` es lo que el usuario decidió aprobar (tal cual o editado).
 */
export async function resolverCandidatoAction(
  candidatoId: string,
  _prevState: EstadoCandidato,
  formData: FormData
): Promise<EstadoCandidato> {
  await requireUser()
  const intent = String(formData.get("intent") ?? "")
  const supabase = await createSupabaseServerClient()

  const { data: candidato, error: errorCandidato } = await supabase
    .from("candidato_especie")
    .select("*")
    .eq("id", candidatoId)
    .single()

  if (errorCandidato || !candidato) {
    return { error: "No se encontró el candidato — puede que ya haya sido procesado en otra pestaña." }
  }
  if (candidato.estado !== "pendiente_revision") {
    return {
      error: `Este candidato ya fue ${candidato.estado === "aprobado" ? "aprobado" : "descartado"} antes.`,
    }
  }

  if (intent === "descartar") {
    const { error } = await supabase
      .from("candidato_especie")
      .update({ estado: "descartado" })
      .eq("id", candidatoId)
    if (error) return { error: error.message }

    revalidatePath("/revision")
    revalidatePath("/especies")
    return { ok: true }
  }

  if (intent !== "aprobar") {
    return { error: "Acción desconocida." }
  }

  const valores = leerValoresEditados(formData)

  if (candidato.tipo_cambio === "nuevo") {
    const nombreComunEs = valores.nombre_comun_es
    const nombreCientifico = valores.nombre_cientifico
    const claseTaxonomica = valores.clase_taxonomica

    if (!nombreComunEs || !nombreCientifico) {
      return { error: "Nombre común (ES) y nombre científico son obligatorios para crear la especie." }
    }
    if (
      !claseTaxonomica ||
      !CLASE_TAXONOMICA_VALUES.includes(
        claseTaxonomica as (typeof CLASE_TAXONOMICA_VALUES)[number]
      )
    ) {
      return { error: "Elegí una clase taxonómica válida antes de aprobar." }
    }

    // Se crea como borrador a propósito (no publicado): el scraper solo
    // aporta un subconjunto de campos (nunca fotos, hábitat, ubicación breve
    // ni estado de conservación), así que casi siempre falta completar algo
    // en el formulario manual antes de que esté lista para publicarse — ver
    // resumen del agente.
    const payload: TablesInsert<"especie"> = {
      nombre_comun_es: nombreComunEs,
      nombre_comun_en: valores.nombre_comun_en ?? null,
      nombre_cientifico: nombreCientifico,
      clase_taxonomica: claseTaxonomica as Enums<"clase_taxonomica_enum">,
      familia: valores.familia ?? null,
      descripcion_es: valores.descripcion_es ?? null,
      descripcion_en: valores.descripcion_en ?? null,
      habitat_es: valores.habitat_es ?? null,
      habitat_en: valores.habitat_en ?? null,
      ubicacion_breve_es: valores.ubicacion_breve_es ?? null,
      ubicacion_breve_en: valores.ubicacion_breve_en ?? null,
      atribucion_fuente: valores.atribucion_fuente ?? null,
      origen_dato: "scraping",
      estado_publicacion: "borrador",
    }

    const { data: nueva, error: errorInsert } = await supabase
      .from("especie")
      .insert(payload)
      .select("id")
      .single()
    if (errorInsert || !nueva) {
      const errorGate = interpretarErrorGatePublicacion(errorInsert?.message)
      return {
        error:
          errorGate ?? `No se pudo crear la especie: ${errorInsert?.message ?? "error desconocido"}`,
      }
    }

    const { error: errorAprobar } = await supabase
      .from("candidato_especie")
      .update({ estado: "aprobado", especie_id: nueva.id })
      .eq("id", candidatoId)
    if (errorAprobar) {
      return {
        error: `La especie se creó como borrador, pero no se pudo marcar el candidato como aprobado: ${errorAprobar.message}`,
      }
    }

    revalidatePath("/especies")
    revalidatePath("/revision")
    return { ok: true }
  }

  // tipo_cambio === "actualizacion"
  if (!candidato.especie_id) {
    return { error: "Candidato de actualización sin especie asociada — dato inconsistente, descartalo." }
  }

  const { data: especieActual, error: errorActual } = await supabase
    .from("especie")
    .select("*")
    .eq("id", candidato.especie_id)
    .single()
  if (errorActual || !especieActual) {
    return { error: "No se encontró la especie a actualizar — puede haber sido borrada." }
  }

  const cambios: Record<string, string | null> = {}
  for (const campo of CAMPOS_EDITABLES) {
    if (campo in valores) cambios[campo] = valores[campo]
  }

  if (
    cambios.clase_taxonomica &&
    !CLASE_TAXONOMICA_VALUES.includes(
      cambios.clase_taxonomica as (typeof CLASE_TAXONOMICA_VALUES)[number]
    )
  ) {
    return { error: "Clase taxonómica inválida." }
  }
  if (cambios.nombre_comun_es === null) {
    return { error: "El nombre común (ES) no puede quedar vacío." }
  }
  if (cambios.nombre_cientifico === null) {
    return { error: "El nombre científico no puede quedar vacío." }
  }

  // Regla explícita del dispatch: nunca publicar con un idioma bilingüe
  // vacío en silencio. Si la especie ya está publicada, simulamos el
  // resultado final antes de aplicar el cambio.
  const fusionada = { ...especieActual, ...cambios } as Tables<"especie">
  if (especieActual.estado_publicacion === "publicado") {
    const faltantes = camposBilinguesFaltantes(fusionada)
    if (faltantes.length > 0) {
      return {
        error: `Esta especie ya está publicada — aprobar así dejaría un idioma vacío (${faltantes.join(
          ", "
        )}). Completá el campo que falta en el formulario de arriba antes de aprobar.`,
      }
    }
  }

  const { error: errorUpdate } = await supabase
    .from("especie")
    .update(cambios as TablesUpdate<"especie">)
    .eq("id", candidato.especie_id)
  if (errorUpdate) {
    const errorGate = interpretarErrorGatePublicacion(errorUpdate.message)
    return {
      error: errorGate ?? `No se pudo aplicar la actualización: ${errorUpdate.message}`,
    }
  }

  const { error: errorAprobar } = await supabase
    .from("candidato_especie")
    .update({ estado: "aprobado" })
    .eq("id", candidatoId)
  if (errorAprobar) {
    return {
      error: `El cambio se aplicó a la especie, pero no se pudo marcar el candidato como aprobado: ${errorAprobar.message}`,
    }
  }

  revalidatePath("/especies")
  revalidatePath(`/especies/${candidato.especie_id}/editar`)
  revalidatePath("/revision")
  return { ok: true }
}
