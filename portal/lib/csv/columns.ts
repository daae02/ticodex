import { Constants } from "@/lib/database.types"

/**
 * Contrato de columnas de `data/template_especies.csv` (raíz del repo).
 * Esto NO es una copia del archivo — es la descripción de qué hace el
 * importador con cada columna. Si el CSV cambia de forma, `parseCsvText`
 * (lib/csv/parse.ts) lo detecta comparando contra el header real del archivo
 * en disco, así este mapeo nunca queda mudo respecto de la fuente de verdad.
 */
export const CLASE_TAXONOMICA_VALUES = Constants.public.Enums.clase_taxonomica_enum
export const ESTADO_CONSERVACION_VALUES =
  Constants.public.Enums.estado_conservacion_enum
export const ORIGEN_DATO_VALUES = Constants.public.Enums.origen_dato_enum
export const FOTO_TIPO_VALUES = Constants.public.Enums.especie_foto_tipo_enum

/** Columnas que hoy existen en el CSV pero no tienen columna en `especie`
 * (son de Fase 3 — zonas de vida de Holdridge, ver PLAN_IMPLEMENTACION.md).
 * Se aceptan en el archivo pero se ignoran al insertar, con aviso explícito
 * en el preview — nunca se insertan "en silencio". */
export const COLUMNAS_IGNORADAS_FASE3 = [
  "region_zonas_vida",
  "frecuencia_estimada_inicial",
] as const

/** Columnas de foto: URL directa (el CSV asume que ya están alojadas en algún
 * lado — no se suben a Storage acá, eso es el flujo del formulario manual). */
export const COLUMNAS_FOTO_URL: Record<string, (typeof FOTO_TIPO_VALUES)[number]> = {
  foto_adulto_url: "adulto",
  foto_juvenil_url: "juvenil",
  foto_macho_url: "macho",
  foto_hembra_url: "hembra",
}

export const HEADER_ESPERADO = [
  "nombre_comun_es",
  "nombre_comun_en",
  "nombre_cientifico",
  "clase_taxonomica",
  "familia",
  "estado_conservacion",
  "endemica",
  "descripcion_es",
  "descripcion_en",
  "habitat_es",
  "habitat_en",
  "ubicacion_breve_es",
  "ubicacion_breve_en",
  "region_zonas_vida",
  "frecuencia_estimada_inicial",
  "foto_adulto_url",
  "foto_juvenil_url",
  "foto_macho_url",
  "foto_hembra_url",
  "sonido_url",
  "origen_dato",
] as const

export type ColumnaCsv = (typeof HEADER_ESPERADO)[number]
