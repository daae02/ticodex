import "server-only"
import { readFile } from "node:fs/promises"
import path from "node:path"

/**
 * `data/template_especies.csv` vive en la raíz del repo Ticodex, un nivel
 * arriba de `portal/`. Este es el ÚNICO lugar donde leemos ese archivo — la
 * descarga de plantilla (app/api/plantilla-csv) y la validación de upload
 * (lib/csv/parse.ts) reusan esta misma función, para no terminar con una
 * copia distinta del CSV adentro de portal/ (regla explícita del dispatch).
 */
export const TEMPLATE_CSV_PATH = path.join(
  process.cwd(),
  "..",
  "data",
  "template_especies.csv"
)

export async function readTemplateCsv(): Promise<string> {
  try {
    return await readFile(TEMPLATE_CSV_PATH, "utf-8")
  } catch {
    throw new Error(
      `No se encontró data/template_especies.csv en ${TEMPLATE_CSV_PATH}. ` +
        "Ese archivo es la fuente de verdad del esquema CSV (compartida con el scraper) " +
        "y debe existir en la raíz del repo Ticodex."
    )
  }
}
