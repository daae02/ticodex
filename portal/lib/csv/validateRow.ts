import type { Enums } from "@/lib/database.types"
import {
  CLASE_TAXONOMICA_VALUES,
  COLUMNAS_FOTO_URL,
  COLUMNAS_IGNORADAS_FASE3,
  ESTADO_CONSERVACION_VALUES,
  ORIGEN_DATO_VALUES,
} from "./columns"

export interface EspecieDesdeCsv {
  nombre_comun_es: string
  nombre_comun_en: string
  nombre_cientifico: string
  clase_taxonomica: Enums<"clase_taxonomica_enum">
  familia: string | null
  estado_conservacion: Enums<"estado_conservacion_enum"> | null
  endemica: boolean
  descripcion_es: string | null
  descripcion_en: string | null
  habitat_es: string | null
  habitat_en: string | null
  ubicacion_breve_es: string | null
  ubicacion_breve_en: string | null
  sonido_url: string | null
  origen_dato: Enums<"origen_dato_enum">
  fotos: { tipo: Enums<"especie_foto_tipo_enum">; url: string }[]
}

export interface FilaValidada {
  numeroFila: number
  nombreParaMostrar: string
  ok: boolean
  errores: string[]
  avisos: string[]
  datos: EspecieDesdeCsv | null
}

const URL_RE = /^https?:\/\/\S+$/i
const BOOLEANOS_VERDADEROS = new Set(["true", "1", "si", "sí", "yes", "x"])
const BOOLEANOS_FALSOS = new Set(["false", "0", "no", ""])

function vacio(v: string | undefined): boolean {
  return v == null || v.trim() === ""
}

/**
 * Valida una fila cruda del CSV contra el esquema de `especie`/`especie_foto`.
 * No inserta nada — devuelve ok/errores para el preview (regla explícita:
 * nunca insertar sin mostrar antes qué pasa fila por fila).
 *
 * Interpretación de "bilingüe completo o pendiente" para este flujo (import
 * masivo, ver resumen del agente): nombre_comun_es/en son obligatorios acá
 * (igual que en el mockup de referencia); descripción/hábitat/ubicación
 * bilingües pueden quedar incompletos en el CSV — la fila entra como
 * `borrador` y el gate real de "no publicar con un idioma vacío" se aplica
 * recién al publicar (formulario manual), no al importar.
 */
export function validarFilaCsv(
  fila: Record<string, string>,
  numeroFila: number,
  nombresCientificosVistos: Set<string>,
  nombresCientificosExistentes: Set<string>
): FilaValidada {
  const errores: string[] = []
  const avisos: string[] = []

  const nombreComunEs = (fila.nombre_comun_es ?? "").trim()
  const nombreComunEn = (fila.nombre_comun_en ?? "").trim()
  const nombreCientifico = (fila.nombre_cientifico ?? "").trim()
  const claseTaxonomica = (fila.clase_taxonomica ?? "").trim()
  const estadoConservacion = (fila.estado_conservacion ?? "").trim()
  const endemicaRaw = (fila.endemica ?? "").trim().toLowerCase()
  const origenDatoRaw = (fila.origen_dato ?? "").trim()

  const nombreParaMostrar = nombreComunEs || nombreCientifico || "—"

  if (vacio(nombreComunEs)) errores.push("falta nombre_comun_es")
  if (vacio(nombreComunEn)) errores.push("falta nombre_comun_en")
  if (vacio(nombreCientifico)) errores.push("falta nombre_cientifico")

  if (vacio(claseTaxonomica)) {
    errores.push("falta clase_taxonomica")
  } else if (
    !CLASE_TAXONOMICA_VALUES.includes(
      claseTaxonomica as (typeof CLASE_TAXONOMICA_VALUES)[number]
    )
  ) {
    errores.push(
      `clase_taxonomica inválida: "${claseTaxonomica}" (valores válidos: ${CLASE_TAXONOMICA_VALUES.join(", ")})`
    )
  }

  let estadoConservacionValido: Enums<"estado_conservacion_enum"> | null = null
  if (!vacio(estadoConservacion)) {
    if (
      ESTADO_CONSERVACION_VALUES.includes(
        estadoConservacion as (typeof ESTADO_CONSERVACION_VALUES)[number]
      )
    ) {
      estadoConservacionValido =
        estadoConservacion as Enums<"estado_conservacion_enum">
    } else {
      errores.push(
        `estado_conservacion inválido: "${estadoConservacion}" (UICN: ${ESTADO_CONSERVACION_VALUES.join(", ")})`
      )
    }
  }

  let endemica = false
  if (BOOLEANOS_VERDADEROS.has(endemicaRaw)) endemica = true
  else if (BOOLEANOS_FALSOS.has(endemicaRaw)) endemica = false
  else errores.push(`endemica inválido: "${fila.endemica}" (usá true/false)`)

  let origenDato: Enums<"origen_dato_enum"> = "manual"
  if (!vacio(origenDatoRaw)) {
    if (
      ORIGEN_DATO_VALUES.includes(
        origenDatoRaw as (typeof ORIGEN_DATO_VALUES)[number]
      )
    ) {
      origenDato = origenDatoRaw as Enums<"origen_dato_enum">
    } else {
      errores.push(
        `origen_dato inválido: "${origenDatoRaw}" (${ORIGEN_DATO_VALUES.join(", ")})`
      )
    }
  }

  const fotos: { tipo: Enums<"especie_foto_tipo_enum">; url: string }[] = []
  for (const [columna, tipo] of Object.entries(COLUMNAS_FOTO_URL)) {
    const valor = (fila[columna] ?? "").trim()
    if (vacio(valor)) continue
    if (!URL_RE.test(valor)) {
      errores.push(`${columna} no es una URL http(s) válida`)
      continue
    }
    fotos.push({ tipo, url: valor })
  }

  const sonidoUrl = (fila.sonido_url ?? "").trim()
  if (!vacio(sonidoUrl) && !URL_RE.test(sonidoUrl)) {
    errores.push("sonido_url no es una URL http(s) válida")
  }

  for (const col of COLUMNAS_IGNORADAS_FASE3) {
    if (!vacio(fila[col])) {
      avisos.push(
        `columna "${col}" no se guarda todavía (es de una fase futura del roadmap) — el valor del archivo se ignora`
      )
    }
  }

  const claveNombre = nombreCientifico.toLowerCase()
  if (!vacio(nombreCientifico)) {
    if (nombresCientificosVistos.has(claveNombre)) {
      errores.push("nombre_cientifico duplicado dentro del mismo archivo")
    } else if (nombresCientificosExistentes.has(claveNombre)) {
      errores.push(
        "ya existe una especie con este nombre_cientifico — subir CSV solo crea especies nuevas; para actualizar una publicada usá el formulario o la cola de revisión del scraper"
      )
    }
  }

  if (vacio(nombreComunEs) === false && errores.length === 0) {
    nombresCientificosVistos.add(claveNombre)
  }

  if (!vacio(fila.descripcion_es) && vacio(fila.descripcion_en)) {
    avisos.push("descripcion_en vacío — quedará pendiente hasta publicar")
  }
  if (vacio(fila.descripcion_es) && !vacio(fila.descripcion_en)) {
    avisos.push("descripcion_es vacío — quedará pendiente hasta publicar")
  }

  const ok = errores.length === 0

  return {
    numeroFila,
    nombreParaMostrar,
    ok,
    errores,
    avisos,
    datos: ok
      ? {
          nombre_comun_es: nombreComunEs,
          nombre_comun_en: nombreComunEn,
          nombre_cientifico: nombreCientifico,
          clase_taxonomica: claseTaxonomica as Enums<"clase_taxonomica_enum">,
          familia: vacio(fila.familia) ? null : fila.familia.trim(),
          estado_conservacion: estadoConservacionValido,
          endemica,
          descripcion_es: vacio(fila.descripcion_es)
            ? null
            : fila.descripcion_es.trim(),
          descripcion_en: vacio(fila.descripcion_en)
            ? null
            : fila.descripcion_en.trim(),
          habitat_es: vacio(fila.habitat_es) ? null : fila.habitat_es.trim(),
          habitat_en: vacio(fila.habitat_en) ? null : fila.habitat_en.trim(),
          ubicacion_breve_es: vacio(fila.ubicacion_breve_es)
            ? null
            : fila.ubicacion_breve_es.trim(),
          ubicacion_breve_en: vacio(fila.ubicacion_breve_en)
            ? null
            : fila.ubicacion_breve_en.trim(),
          sonido_url: vacio(sonidoUrl) ? null : sonidoUrl,
          origen_dato: origenDato,
          fotos,
        }
      : null,
  }
}
