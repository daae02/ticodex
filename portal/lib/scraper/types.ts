import type { Enums } from "@/lib/database.types"

/** Campos que una fuente puede aportar para una especie semilla. Todo
 * opcional — cada fuente llena lo que puede, nunca inventa lo que no sabe. */
export interface CamposExtraidos {
  nombre_comun_es?: string
  nombre_comun_en?: string
  clase_taxonomica?: Enums<"clase_taxonomica_enum">
  familia?: string
  descripcion_es?: string
  descripcion_en?: string
  /** Solo se llena cuando el código que expone la fuente coincide con el
   * enum UICN (LC/NT/VU/EN/CR/EW/EX/DD) — si la fuente usa otra taxonomía de
   * estado de conservación (ej. NatureServe), se deja sin dato en vez de
   * adivinar un mapeo. */
  estado_conservacion?: Enums<"estado_conservacion_enum">
  /** URL externa (no re-hosteada) a una foto candidata a `especie_foto.tipo
   * = 'adulto'`, con licencia que permite redistribución no comercial (nunca
   * cuando la fuente la marca como todos los derechos reservados). Es
   * puramente informativa para quien revisa: nunca se crea una fila de
   * `especie_foto` automáticamente a partir de esto — el equipo la revisa y,
   * si sirve, la sube a mano desde el formulario de la especie. */
  fotoAdultoCandidataUrl?: string
  /** Texto de atribución de la foto candidata (fotógrafo/licencia), para que
   * quien la suba a mano sepa qué crédito poner. */
  fotoAdultoCandidataAtribucion?: string
}

export interface ResultadoFuente {
  fuente: string
  nombreCientifico: string
  campos: CamposExtraidos
  /** true si la fuente corrió pero no hay licencia confirmada para
   * redistribuir lo que devolvió — el orquestador la descarta igual, esto es
   * solo para logging/reporte. */
  bloqueadaPorLicencia?: boolean
}

export interface FuenteScraper {
  /** Nombre mostrado en el panel y guardado en candidato_especie.fuente. */
  nombre: string
  /** Si la licencia/ToS de la fuente no está confirmada para extraer y
   * redistribuir estos datos, la fuente queda configurada pero no se
   * ejecuta — ver lib/scraper/config.ts y el resumen del agente. */
  licenciaConfirmada: boolean
  motivoLicencia?: string
  buscarEspecie(nombreCientifico: string): Promise<ResultadoFuente | null>
}
