"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { requireUser, createSupabaseServerClient } from "@/lib/supabase/server"
import {
  camposBilinguesFaltantes,
  interpretarErrorGatePublicacion,
  tokensBilinguesFaltantes,
  tokensGatePublicacion,
} from "@/lib/especie/validate"
import type { Enums, TablesInsert } from "@/lib/database.types"
import {
  CLASE_TAXONOMICA_VALUES,
  ESTADO_CONSERVACION_VALUES,
} from "@/lib/csv/columns"

export interface EstadoFormularioEspecie {
  error?: string
  ok?: boolean
  /** Nombres de columna puntuales que faltan (ej. ["descripcion_en",
   * "foto_hembra"]) para marcar visualmente el input/label correspondiente
   * en EspecieForm.tsx — ver lib/especie/validate.ts. Campos que no tienen
   * input en este formulario (foto_*) solo aparecen en `error` como texto. */
  camposFaltantes?: string[]
}

function texto(formData: FormData, campo: string): string | null {
  const v = String(formData.get(campo) ?? "").trim()
  return v === "" ? null : v
}

function camposComunes(formData: FormData) {
  const claseTaxonomica = String(formData.get("clase_taxonomica") ?? "")
  const estadoConservacion = String(formData.get("estado_conservacion") ?? "")

  if (
    !CLASE_TAXONOMICA_VALUES.includes(
      claseTaxonomica as (typeof CLASE_TAXONOMICA_VALUES)[number]
    )
  ) {
    throw new Error("Clase taxonómica inválida.")
  }

  const estadoConservacionValido =
    estadoConservacion === ""
      ? null
      : ESTADO_CONSERVACION_VALUES.includes(
            estadoConservacion as (typeof ESTADO_CONSERVACION_VALUES)[number]
          )
        ? (estadoConservacion as Enums<"estado_conservacion_enum">)
        : null

  return {
    nombre_comun_es: texto(formData, "nombre_comun_es") ?? "",
    nombre_comun_en: texto(formData, "nombre_comun_en"),
    nombre_cientifico: texto(formData, "nombre_cientifico") ?? "",
    clase_taxonomica: claseTaxonomica as Enums<"clase_taxonomica_enum">,
    familia: texto(formData, "familia"),
    estado_conservacion: estadoConservacionValido,
    endemica: formData.get("endemica") === "on",
    descripcion_es: texto(formData, "descripcion_es"),
    descripcion_en: texto(formData, "descripcion_en"),
    habitat_es: texto(formData, "habitat_es"),
    habitat_en: texto(formData, "habitat_en"),
    ubicacion_breve_es: texto(formData, "ubicacion_breve_es"),
    ubicacion_breve_en: texto(formData, "ubicacion_breve_en"),
    atribucion_fuente: texto(formData, "atribucion_fuente"),
    tiene_dimorfismo_sexual: formData.get("tiene_dimorfismo_sexual") === "on",
    tiene_diferencia_juvenil: formData.get("tiene_diferencia_juvenil") === "on",
  }
}

export async function crearEspecieAction(
  _prevState: EstadoFormularioEspecie,
  formData: FormData
): Promise<EstadoFormularioEspecie> {
  await requireUser()
  const intent = String(formData.get("intent") ?? "borrador")

  let campos
  try {
    campos = camposComunes(formData)
  } catch (e) {
    return { error: (e as Error).message, camposFaltantes: ["clase_taxonomica"] }
  }

  if (!campos.nombre_comun_es || !campos.nombre_cientifico) {
    return {
      error: "Nombre común (ES) y nombre científico son obligatorios.",
      camposFaltantes: [
        ...(!campos.nombre_comun_es ? ["nombre_comun_es"] : []),
        ...(!campos.nombre_cientifico ? ["nombre_cientifico"] : []),
      ],
    }
  }

  const estadoPublicacion: Enums<"estado_publicacion_enum"> =
    intent === "publicar" ? "publicado" : "borrador"

  if (estadoPublicacion === "publicado") {
    const faltantes = camposBilinguesFaltantes(campos)
    if (faltantes.length > 0) {
      return {
        error: `No se puede publicar: faltan campos bilingües — ${faltantes.join(", ")}.`,
        camposFaltantes: tokensBilinguesFaltantes(campos),
      }
    }
  }

  const supabase = await createSupabaseServerClient()
  const payload: TablesInsert<"especie"> = {
    ...campos,
    origen_dato: "manual",
    estado_publicacion: estadoPublicacion,
  }

  const { data, error } = await supabase
    .from("especie")
    .insert(payload)
    .select("id")
    .single()

  if (error) {
    const errorGate = interpretarErrorGatePublicacion(error.message)
    return {
      error: errorGate ?? `No se pudo guardar: ${error.message}`,
      camposFaltantes: errorGate ? tokensGatePublicacion(error.message) : undefined,
    }
  }

  revalidatePath("/especies")
  redirect(`/especies/${data.id}/editar?creada=1`)
}

export async function actualizarEspecieAction(
  especieId: string,
  _prevState: EstadoFormularioEspecie,
  formData: FormData
): Promise<EstadoFormularioEspecie> {
  await requireUser()
  const intent = String(formData.get("intent") ?? "guardar")

  let campos
  try {
    campos = camposComunes(formData)
  } catch (e) {
    return { error: (e as Error).message, camposFaltantes: ["clase_taxonomica"] }
  }

  if (!campos.nombre_comun_es || !campos.nombre_cientifico) {
    return {
      error: "Nombre común (ES) y nombre científico son obligatorios.",
      camposFaltantes: [
        ...(!campos.nombre_comun_es ? ["nombre_comun_es"] : []),
        ...(!campos.nombre_cientifico ? ["nombre_cientifico"] : []),
      ],
    }
  }

  const supabase = await createSupabaseServerClient()

  const { data: actual, error: errorActual } = await supabase
    .from("especie")
    .select("estado_publicacion")
    .eq("id", especieId)
    .single()

  if (errorActual || !actual) {
    return { error: "No se encontró la especie." }
  }

  let estadoPublicacion = actual.estado_publicacion
  if (intent === "publicar") {
    const faltantes = camposBilinguesFaltantes(campos)
    if (faltantes.length > 0) {
      return {
        error: `No se puede publicar: faltan campos bilingües — ${faltantes.join(", ")}.`,
        camposFaltantes: tokensBilinguesFaltantes(campos),
      }
    }
    estadoPublicacion = "publicado"
  } else if (intent === "despublicar") {
    estadoPublicacion = "borrador"
  }

  const { error } = await supabase
    .from("especie")
    .update({ ...campos, estado_publicacion: estadoPublicacion })
    .eq("id", especieId)

  if (error) {
    const errorGate = interpretarErrorGatePublicacion(error.message)
    return {
      error: errorGate ?? `No se pudo guardar: ${error.message}`,
      camposFaltantes: errorGate ? tokensGatePublicacion(error.message) : undefined,
    }
  }

  revalidatePath("/especies")
  revalidatePath(`/especies/${especieId}/editar`)
  return { ok: true }
}
