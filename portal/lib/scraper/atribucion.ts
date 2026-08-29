import "server-only"

/**
 * Texto de atribución por fuente para `especie.atribucion_fuente` — solo las
 * fuentes que exigen atribución visible llevan la licencia en la etiqueta
 * (Wikipedia, CC-BY-SA); GBIF e iNaturalist se listan por nombre porque su
 * cobertura hoy depende del criterio "proyecto no comercial" (PROYECTO.md
 * §9), no de una obligación de atribución puntual.
 */
const ETIQUETAS_ATRIBUCION: Record<string, string> = {
  "Wikipedia especies": "Wikipedia (CC-BY-SA)",
}

function etiquetaFuente(nombreFuente: string): string {
  return ETIQUETAS_ATRIBUCION[nombreFuente] ?? nombreFuente
}

const PREFIJO = "Datos: "

/**
 * Arma (o extiende) el texto legible de `especie.atribucion_fuente`
 * combinando las fuentes que ya contribuían datos a esta especie con una
 * fuente nueva que acaba de aportar un campo. Nunca duplica una fuente ya
 * listada, incluso si `nuevaFuente` viene con una etiqueta distinta (ej. ya
 * listada como "Wikipedia especies" y ahora aparece como "Wikipedia
 * (CC-BY-SA)").
 */
export function construirAtribucionFuente(
  atribucionExistente: string | null | undefined,
  nuevaFuente: string
): string {
  const existentes = (atribucionExistente ?? "")
    .replace(PREFIJO, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const etiquetaNueva = etiquetaFuente(nuevaFuente)
  const baseNueva = etiquetaNueva.split(" (")[0].trim()
  const yaListada = existentes.some((e) => e.split(" (")[0].trim() === baseNueva)

  const lista = yaListada ? existentes : [...existentes, etiquetaNueva]
  return `${PREFIJO}${lista.join(", ")}`
}
