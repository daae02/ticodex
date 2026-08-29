import Papa from "papaparse"
import { HEADER_ESPERADO } from "./columns"

export interface CsvParseado {
  header: string[]
  headerOk: boolean
  headerErrores: string[]
  filas: Record<string, string>[]
  erroresParseo: string[]
}

/** Parsea el texto crudo del CSV y valida que el header coincida con el de
 * `data/template_especies.csv` (mismo set de columnas, orden no importa). */
export function parseCsvText(text: string): CsvParseado {
  const resultado = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const header = resultado.meta.fields ?? []
  const headerEsperadoSet = new Set(HEADER_ESPERADO)
  const headerRecibidoSet = new Set(header)

  const faltantes = HEADER_ESPERADO.filter((c) => !headerRecibidoSet.has(c))
  const sobrantes = header.filter(
    (c) => !headerEsperadoSet.has(c as (typeof HEADER_ESPERADO)[number])
  )

  const headerErrores: string[] = []
  if (faltantes.length > 0) {
    headerErrores.push(`Faltan columnas: ${faltantes.join(", ")}`)
  }
  if (sobrantes.length > 0) {
    headerErrores.push(`Columnas desconocidas: ${sobrantes.join(", ")}`)
  }

  return {
    header,
    headerOk: headerErrores.length === 0,
    headerErrores,
    filas: resultado.data,
    erroresParseo: resultado.errors.map(
      (e) => `Fila ${e.row != null ? e.row + 2 : "?"}: ${e.message}`
    ),
  }
}
