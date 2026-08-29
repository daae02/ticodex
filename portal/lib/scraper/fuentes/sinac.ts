import "server-only"
import type { FuenteScraper, ResultadoFuente } from "../types"

/**
 * SINAC (Sistema Nacional de Áreas de Conservación de Costa Rica). A la fecha
 * de este dispatch no se encontró una API pública documentada para consultar
 * especies, ni términos de uso explícitos que autoricen extraer y
 * redistribuir contenido de su sitio — solo scraping de HTML sin ToS claro,
 * que no vamos a asumir que está permitido (regla explícita del dispatch de
 * portal-web). Por eso no está implementada: `buscarEspecie` no hace ninguna
 * llamada de red y siempre devuelve `null`.
 *
 * Pista sin confirmar (PROYECTO.md §9, 2026-08-10): el Portal Nacional de
 * Datos Abiertos de Costa Rica (datosabiertos.gob.go.cr) y el SNIT podrían
 * tener algo publicado con licencia clara — nadie lo revisó todavía a mano.
 * No lo implementes ni asumas que sirve a partir de este comentario; es
 * trabajo pendiente para una persona, no algo que se resuelva en código.
 *
 * Queda igual configurada (no omitida en silencio) para que en /fuentes se
 * vea explícitamente como "bloqueada" y por qué — ver resumen del agente.
 */
async function buscarEspecie(_nombreCientifico: string): Promise<ResultadoFuente | null> {
  return null
}

export const fuenteSinac: FuenteScraper = {
  nombre: "SINAC",
  licenciaConfirmada: false,
  motivoLicencia:
    "No se encontró una API pública documentada de SINAC para especies, ni términos de uso que autoricen extraer y redistribuir su contenido — no implementado hasta confirmarlo directamente con SINAC.",
  buscarEspecie,
}
