import type { FuenteScraper } from "./types"
import { fuenteSinac } from "./fuentes/sinac"
import { fuenteInaturalist } from "./fuentes/inaturalist"
import { fuenteGbif } from "./fuentes/gbif"
import { fuenteWikipedia } from "./fuentes/wikipedia"

/**
 * Configuración FIJA del scraper de la Fase 1 (PROYECTO.md §2,
 * PLAN_IMPLEMENTACION.md Fase 1) a nivel de FUENTE — nada de esto se elige
 * desde la UI, eso es Fase 5 (configurador de fuentes/campos por corrida).
 * Para agregar/quitar una fuente se edita este archivo, no el panel.
 *
 * Decisión 2026-08-10 (dispatch "Cambio de flujo en Fuentes/Scraping"): ya
 * NO existe una lista fija de especies que el scraper recorra por su cuenta
 * — el scraper nunca elige una especie arbitrariamente. El flujo es: el
 * equipo busca un nombre en `/fuentes` (ver ./busqueda.ts), confirma cuál de
 * los candidatos es, y recién ahí se corre `runScraper` para ESA especie
 * puntual (ver ./orchestrator.ts). Este archivo solo configura qué fuentes
 * existen y si tienen licencia/ToS confirmada para extraer y redistribuir.
 *
 * Estado de licencias (PROYECTO.md §9, decisión 2026-08-10): Ticodex es no
 * comercial por ahora, lo que habilita contenido CC-BY-NC, y se agregó
 * `especie.atribucion_fuente` para las licencias que exigen atribución
 * visible (CC-BY-SA de Wikipedia). Con eso, **GBIF, iNaturalist y Wikipedia
 * especies quedan `licenciaConfirmada: true`** (ver el motivo puntual en cada
 * `./fuentes/*.ts`). **SINAC sigue `licenciaConfirmada: false`** — no tiene
 * API pública documentada ni ToS de scraping confirmado; hay una pista sin
 * revisar (Portal Nacional de Datos Abiertos, SNIT) documentada en
 * `./fuentes/sinac.ts`, pendiente de que alguien la confirme a mano.
 */
export const FUENTES_CONFIGURADAS: FuenteScraper[] = [
  fuenteSinac,
  fuenteInaturalist,
  fuenteGbif,
  fuenteWikipedia,
]
