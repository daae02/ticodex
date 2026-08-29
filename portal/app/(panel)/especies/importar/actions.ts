"use server"

import { revalidatePath } from "next/cache"
import { requireUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseStorageBucket } from "@/lib/supabase/env"
import { parseCsvText } from "@/lib/csv/parse"
import { validarFilaCsv, type FilaValidada } from "@/lib/csv/validateRow"
import type { TablesInsert } from "@/lib/database.types"

export interface EstadoPreviewCsv {
  fase: "inicial" | "preview" | "error"
  error?: string
  csvText?: string
  nombreArchivo?: string
  filas?: FilaValidada[]
  totalOk?: number
  totalError?: number
}

async function nombresCientificosExistentes(): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from("especie").select("nombre_cientifico")
  return new Set((data ?? []).map((r) => r.nombre_cientifico.toLowerCase()))
}

function validarTexto(texto: string, existentes: Set<string>) {
  const parseado = parseCsvText(texto)
  const vistos = new Set<string>()
  const filas: FilaValidada[] = parseado.filas.map((fila, i) =>
    validarFilaCsv(fila, i + 2, vistos, existentes)
  )
  return { parseado, filas }
}

export async function validarCsvAction(
  _prevState: EstadoPreviewCsv,
  formData: FormData
): Promise<EstadoPreviewCsv> {
  await requireUser()

  const file = formData.get("archivo")
  if (!(file instanceof File) || file.size === 0) {
    return { fase: "error", error: "Elegí un archivo CSV." }
  }

  const texto = await file.text()
  const existentes = await nombresCientificosExistentes()
  const { parseado, filas } = validarTexto(texto, existentes)

  if (!parseado.headerOk) {
    return {
      fase: "error",
      error: `El archivo no tiene las columnas de data/template_especies.csv: ${parseado.headerErrores.join(" · ")}`,
    }
  }
  if (parseado.erroresParseo.length > 0) {
    return {
      fase: "error",
      error: `Error leyendo el CSV: ${parseado.erroresParseo.join(" · ")}`,
    }
  }
  if (filas.length === 0) {
    return { fase: "error", error: "El archivo no tiene filas de datos." }
  }

  return {
    fase: "preview",
    csvText: texto,
    nombreArchivo: file.name,
    filas,
    totalOk: filas.filter((f) => f.ok).length,
    totalError: filas.filter((f) => !f.ok).length,
  }
}

export interface EstadoConfirmacionCsv {
  fase: "confirmado" | "error"
  error?: string
  importJobId?: string
  insertadas?: number
  fallidas?: number
}

export async function confirmarImportAction(
  _prevState: EstadoConfirmacionCsv | undefined,
  formData: FormData
): Promise<EstadoConfirmacionCsv> {
  const user = await requireUser()

  const csvText = String(formData.get("csvText") ?? "")
  const nombreArchivo = String(formData.get("nombreArchivo") ?? "import.csv")
  if (!csvText) {
    return { fase: "error", error: "No hay datos validados para importar." }
  }

  // Se revalida contra la base de nuevo (no confiamos en el preview del
  // cliente: puede haber cambiado algo entre la validación y la confirmación).
  const existentes = await nombresCientificosExistentes()
  const { filas } = validarTexto(csvText, existentes)

  const filasOk = filas.filter((f) => f.ok && f.datos)
  const filasError = filas.filter((f) => !f.ok)

  const supabase = await createSupabaseServerClient()

  let insertadas = 0
  const erroresInsercion: { fila: number; error: string }[] = []

  for (const fila of filasOk) {
    const datos = fila.datos!
    const payload: TablesInsert<"especie"> = {
      nombre_comun_es: datos.nombre_comun_es,
      nombre_comun_en: datos.nombre_comun_en,
      nombre_cientifico: datos.nombre_cientifico,
      clase_taxonomica: datos.clase_taxonomica,
      familia: datos.familia,
      estado_conservacion: datos.estado_conservacion,
      endemica: datos.endemica,
      descripcion_es: datos.descripcion_es,
      descripcion_en: datos.descripcion_en,
      habitat_es: datos.habitat_es,
      habitat_en: datos.habitat_en,
      ubicacion_breve_es: datos.ubicacion_breve_es,
      ubicacion_breve_en: datos.ubicacion_breve_en,
      sonido_url: datos.sonido_url,
      origen_dato: datos.origen_dato,
      estado_publicacion: "borrador",
    }

    const { data: especieInsertada, error } = await supabase
      .from("especie")
      .insert(payload)
      .select("id")
      .single()

    if (error || !especieInsertada) {
      erroresInsercion.push({
        fila: fila.numeroFila,
        error: error?.message ?? "error desconocido",
      })
      continue
    }

    insertadas += 1

    if (datos.fotos.length > 0) {
      await supabase.from("especie_foto").insert(
        datos.fotos.map((f, idx) => ({
          especie_id: especieInsertada.id,
          tipo: f.tipo,
          url: f.url,
          es_principal: f.tipo === "adulto",
          orden: idx,
        }))
      )
    }
  }

  let archivoCsvUrl: string | null = null
  try {
    const bucket = supabaseStorageBucket()
    const ruta = `imports/${Date.now()}-${nombreArchivo}`
    const { error: errorSubida } = await supabase.storage
      .from(bucket)
      .upload(ruta, new Blob([csvText], { type: "text/csv" }))
    if (!errorSubida) {
      archivoCsvUrl = supabase.storage.from(bucket).getPublicUrl(ruta).data
        .publicUrl
    }
  } catch {
    // El archivo de auditoría es un nice-to-have; no bloquea el import_job.
  }

  const logErrores = [
    ...filasError.map((f) => ({ fila: f.numeroFila, errores: f.errores })),
    ...erroresInsercion.map((e) => ({ fila: e.fila, errores: [e.error] })),
  ]

  const { data: job, error: errorJob } = await supabase
    .from("import_job")
    .insert({
      usuario_admin_id: user.id,
      archivo_csv_url: archivoCsvUrl,
      filas_totales: filas.length,
      filas_ok: insertadas,
      filas_error: filas.length - insertadas,
      log_errores: logErrores,
    })
    .select("id")
    .single()

  if (errorJob) {
    return {
      fase: "error",
      error: `Las especies OK se insertaron (${insertadas}), pero no se pudo guardar el historial de import: ${errorJob.message}`,
    }
  }

  revalidatePath("/especies")
  revalidatePath("/importaciones")

  return {
    fase: "confirmado",
    importJobId: job.id,
    insertadas,
    fallidas: filas.length - insertadas,
  }
}
