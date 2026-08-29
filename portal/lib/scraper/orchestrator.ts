import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { FUENTES_CONFIGURADAS } from "./config"
import { construirAtribucionFuente } from "./atribucion"
import type { CamposExtraidos } from "./types"
import type { CampoDiff } from "./diff"
import type { Json, TablesInsert } from "@/lib/database.types"

export interface ResumenCorridaScraper {
  nombreCientifico: string
  fuentesEjecutadas: string[]
  fuentesBloqueadas: { nombre: string; motivo: string }[]
  candidatosNuevos: number
  candidatosActualizacion: number
  errores: { fuente: string; especie: string; error: string }[]
}

type EspecieResumen = {
  id: string
  nombre_cientifico: string
  nombre_comun_es: string
  nombre_comun_en: string | null
  clase_taxonomica: string
  familia: string | null
  descripcion_es: string | null
  descripcion_en: string | null
  estado_conservacion: string | null
  atribucion_fuente: string | null
}

type CampoExtraidoKey = keyof CamposExtraidos
type Aporte = { fuente: string; campos: CamposExtraidos }

/**
 * Precedencia por campo cuando DOS fuentes proponen el mismo dato para la
 * misma corrida (bug real 2026-08-10: el orquestador insertaba un
 * `candidato_especie` POR FUENTE en vez de fusionar; el orden del loop
 * decidía "quién gana" por accidente). Regla fija, documentada acá porque es
 * la que de verdad importa en runtime — no alcanza con que quede en el
 * resumen del agente:
 *
 * - descripcion_es / descripcion_en: Wikipedia (contenido NATIVO de esa
 *   edición) gana sobre iNaturalist, cuyo `wikipedia_summary` en
 *   descripcion_en es indirecto (a menudo el mismo texto de Wikipedia,
 *   pero puede venir recortado/desactualizado respecto a pedirlo directo).
 * - estado_conservacion, fotoAdultoCandidataUrl/Atribucion: hoy son
 *   EXCLUSIVOS de iNaturalist (ninguna otra fuente configurada los expone),
 *   así que "gana iNaturalist" es más una constancia que una decisión real
 *   — se deja explícito para cuando se sume otra fuente que también los
 *   aporte.
 * - nombre_comun_es / nombre_comun_en: iNaturalist gana sobre GBIF (curación
 *   más activa/mantenida en iNaturalist); el valor descartado NO se pierde,
 *   sigue viéndose y siendo editable en el diff de /revision, así que quien
 *   aprueba puede preferir el de GBIF a mano si lo prefiere.
 * - familia: solo la aporta GBIF hoy.
 * - clase_taxonomica: ninguna fuente configurada la llena todavía (ver
 *   fuentes/*.ts); el orden queda como respaldo para cuando alguna la
 *   aporte, en vez de dejarlo indefinido.
 *
 * Cualquier fuente que no esté listada para un campo (ninguna hoy, pero
 * queda como red de seguridad para fuentes futuras) se prueba al final, en
 * el orden en que corrió — nunca se descarta un dato solo por no estar en
 * esta tabla.
 */
const PRECEDENCIA_POR_CAMPO: Record<CampoExtraidoKey, string[]> = {
  nombre_comun_es: ["iNaturalist", "GBIF"],
  nombre_comun_en: ["iNaturalist", "GBIF"],
  clase_taxonomica: ["GBIF", "iNaturalist", "Wikipedia especies"],
  familia: ["GBIF"],
  descripcion_es: ["Wikipedia especies", "iNaturalist"],
  descripcion_en: ["Wikipedia especies", "iNaturalist"],
  estado_conservacion: ["iNaturalist"],
  fotoAdultoCandidataUrl: ["iNaturalist"],
  fotoAdultoCandidataAtribucion: ["iNaturalist"],
}

/** Compara lo que trajo una fuente contra la especie existente (si la hay) y
 * arma solo las entradas que realmente cambian — nunca proponemos "cambiar"
 * un campo a un valor idéntico al actual. */
function construirDiff(
  campos: CamposExtraidos,
  nombreCientifico: string,
  existente: EspecieResumen | null
): Record<string, CampoDiff> {
  const diff: Record<string, CampoDiff> = {}
  const candidatas: [string, string | undefined][] = [
    ["nombre_cientifico", nombreCientifico],
    ["nombre_comun_es", campos.nombre_comun_es],
    ["nombre_comun_en", campos.nombre_comun_en],
    ["clase_taxonomica", campos.clase_taxonomica],
    ["familia", campos.familia],
    ["descripcion_es", campos.descripcion_es],
    ["descripcion_en", campos.descripcion_en],
    ["estado_conservacion", campos.estado_conservacion],
    // Los dos siguientes no son columnas de `especie` — son informativos
    // para quien revisa (ver types.ts CamposExtraidos). El "actual" nunca
    // existe para ellos, así que siempre se muestran como sugerencia nueva.
    ["foto_adulto_candidata_url", campos.fotoAdultoCandidataUrl],
    ["foto_adulto_candidata_atribucion", campos.fotoAdultoCandidataAtribucion],
  ]

  for (const [campo, propuestoRaw] of candidatas) {
    const propuesto = propuestoRaw?.trim()
    if (!propuesto) continue
    const actual = existente
      ? ((existente as unknown as Record<string, string | null>)[campo] ?? null)
      : null
    if (existente && actual === propuesto) continue // sin cambio real
    diff[campo] = { actual, propuesto }
  }
  return diff
}

/**
 * Fusiona los aportes de todas las fuentes habilitadas que corrieron para
 * ESTA especie en un solo objeto `CamposExtraidos`, aplicando
 * `PRECEDENCIA_POR_CAMPO` cuando dos fuentes proponen el mismo campo. Además
 * devuelve, por campo, cuál fuente ganó — se usa después para armar la
 * lista de fuentes que "realmente aportaron algo" (candidato_especie.fuente)
 * y para acumular la atribución.
 */
function fusionarAportes(aportes: Aporte[]): {
  campos: CamposExtraidos
  fuentePorCampo: Partial<Record<CampoExtraidoKey, string>>
} {
  const campos: CamposExtraidos = {}
  const fuentePorCampo: Partial<Record<CampoExtraidoKey, string>> = {}

  for (const campo of Object.keys(PRECEDENCIA_POR_CAMPO) as CampoExtraidoKey[]) {
    // Orden a probar: la precedencia declarada primero, después cualquier
    // otra fuente que haya corrido (red de seguridad, ver comentario de la
    // tabla), sin repetir nombres.
    const orden = [...PRECEDENCIA_POR_CAMPO[campo], ...aportes.map((a) => a.fuente)]
    const probadas = new Set<string>()
    for (const nombreFuente of orden) {
      if (probadas.has(nombreFuente)) continue
      probadas.add(nombreFuente)
      const aporte = aportes.find((a) => a.fuente === nombreFuente)
      const valor = aporte?.campos[campo]
      if (typeof valor === "string" && valor.trim()) {
        ;(campos as Record<string, string>)[campo] = valor
        fuentePorCampo[campo] = nombreFuente
        break
      }
    }
  }

  return { campos, fuentePorCampo }
}

/**
 * Corre el scraper contra UNA especie puntual, confirmada por el usuario en
 * el buscador de `/fuentes` (ver ./busqueda.ts y
 * app/(panel)/fuentes/FuentesPanel.tsx) — nunca contra una lista precargada:
 * el scraper no elige especies por su cuenta (decisión 2026-08-10,
 * PROYECTO.md §9). Nunca publica ni actualiza `especie` directamente — cada
 * hallazgo queda como fila `pendiente_revision` en `candidato_especie`, para
 * que el equipo interno la apruebe o descarte desde /revision (PROYECTO.md
 * §2, principio de pipeline de dato §6: "nada llega a la lista que ve la app
 * sin pasar por la cola").
 *
 * IMPORTANTE (fix bug 2026-08-10, "3 filas por 1 búsqueda"): esta función
 * corre TODAS las fuentes habilitadas para la especie confirmada y las
 * fusiona en UN SOLO `candidato_especie` por corrida — nunca una fila por
 * fuente. Ver `fusionarAportes` y `PRECEDENCIA_POR_CAMPO` para cómo se
 * resuelve un mismo campo propuesto por dos fuentes distintas.
 *
 * Pensado para invocarse desde `after()` (ver app/(panel)/fuentes/actions.ts)
 * así la corrida no bloquea la respuesta HTTP del botón "Confirmar".
 */
export async function runScraper(nombreCientifico: string): Promise<ResumenCorridaScraper> {
  const resumen: ResumenCorridaScraper = {
    nombreCientifico,
    fuentesEjecutadas: [],
    fuentesBloqueadas: [],
    candidatosNuevos: 0,
    candidatosActualizacion: 0,
    errores: [],
  }

  for (const fuente of FUENTES_CONFIGURADAS) {
    if (!fuente.licenciaConfirmada) {
      resumen.fuentesBloqueadas.push({
        nombre: fuente.nombre,
        motivo: fuente.motivoLicencia ?? "licencia/ToS no confirmada",
      })
    }
  }

  const fuentesHabilitadas = FUENTES_CONFIGURADAS.filter((f) => f.licenciaConfirmada)
  if (fuentesHabilitadas.length === 0) {
    // Hoy (ver resumen del agente): ninguna fuente tiene licencia/ToS
    // confirmada, así que la corrida termina acá — a propósito, no por bug.
    return resumen
  }

  const supabase = await createSupabaseServerClient()

  const { data: existenteRaw } = await supabase
    .from("especie")
    .select(
      "id, nombre_cientifico, nombre_comun_es, nombre_comun_en, clase_taxonomica, familia, descripcion_es, descripcion_en, estado_conservacion, atribucion_fuente"
    )
    .ilike("nombre_cientifico", nombreCientifico)
    .maybeSingle()
  const existente = existenteRaw ?? null

  const { data: pendientes } = await supabase
    .from("candidato_especie")
    .select("especie_id, campos_propuestos")
    .eq("estado", "pendiente_revision")

  // Evita spamear la cola: un candidato es ahora "por especie por corrida"
  // (ya no por fuente), así que la clave de deduplicación también es solo
  // por especie — si ya hay un candidato pendiente_revision para esta
  // especie (nuevo o actualización), no se crea un segundo mientras el
  // equipo no resuelva el primero desde /revision.
  const clavesPendientes = new Set(
    (pendientes ?? []).map((p) => {
      const cp = p.campos_propuestos as Record<string, { propuesto?: string }> | null
      const nc = cp?.nombre_cientifico?.propuesto?.toLowerCase()
      return p.especie_id ?? nc ?? ""
    })
  )

  const clave = existente?.id ?? nombreCientifico.toLowerCase()
  if (clavesPendientes.has(clave)) {
    return resumen
  }

  const fuentesEjecutadas = new Set<string>()
  const aportes: Aporte[] = []

  for (const fuente of fuentesHabilitadas) {
    fuentesEjecutadas.add(fuente.nombre)
    try {
      const resultado = await fuente.buscarEspecie(nombreCientifico)
      if (!resultado || resultado.bloqueadaPorLicencia) continue
      aportes.push({ fuente: fuente.nombre, campos: resultado.campos })
    } catch (e) {
      resumen.errores.push({
        fuente: fuente.nombre,
        especie: nombreCientifico,
        error: (e as Error).message,
      })
    }
  }

  resumen.fuentesEjecutadas = [...fuentesEjecutadas]

  if (aportes.length === 0) return resumen

  const { campos: camposFusionados, fuentePorCampo } = fusionarAportes(aportes)
  const diff = construirDiff(camposFusionados, nombreCientifico, existente)
  if (Object.keys(diff).length === 0) return resumen

  // Fuentes que "realmente aportaron algo" a ESTE candidato: aquellas cuyo
  // valor ganó la precedencia para al menos un campo que terminó en el
  // diff (si el valor de una fuente coincidía con el actual, ese campo no
  // entra al diff y esa fuente no cuenta como aportante). Se listan en el
  // orden en que corrieron las fuentes, no alfabético, para que quede
  // predecible en la UI.
  let fuentesAportantes = fuentesHabilitadas
    .map((f) => f.nombre)
    .filter((nombreFuente) =>
      Object.keys(diff).some(
        (campo) => fuentePorCampo[campo as CampoExtraidoKey] === nombreFuente
      )
    )
  // Red de seguridad: si por alguna razón ninguna fuente quedó "ganadora"
  // de un campo (ej. todas devolvieron datos que ya coincidían con lo
  // existente, pero el diff igual tiene algo como nombre_cientifico para
  // una especie nueva), listamos igual las fuentes que sí devolvieron
  // resultado — mejor eso que un candidato con fuente en blanco.
  if (fuentesAportantes.length === 0) {
    fuentesAportantes = aportes.map((a) => a.fuente)
  }

  // Se acumula la atribución de TODAS las fuentes aportantes de esta
  // corrida sobre la atribución ya existente — construirAtribucionFuente ya
  // deduplica por fuente, así que fusionar antes de llamarla (en vez de
  // llamarla una vez por fuente como antes) da el mismo resultado final.
  const atribucionActual = existente?.atribucion_fuente ?? null
  let atribucionPropuesta = atribucionActual
  for (const nombreFuente of fuentesAportantes) {
    atribucionPropuesta = construirAtribucionFuente(atribucionPropuesta, nombreFuente)
  }
  if (atribucionPropuesta !== atribucionActual) {
    diff.atribucion_fuente = { actual: atribucionActual, propuesto: atribucionPropuesta ?? "" }
  }

  const tipoCambio = existente ? "actualizacion" : "nuevo"
  const payload: TablesInsert<"candidato_especie"> = {
    tipo_cambio: tipoCambio,
    especie_id: existente?.id ?? null,
    fuente: fuentesAportantes.join(", "),
    campos_propuestos: diff as unknown as Json,
    estado: "pendiente_revision",
  }
  const { error } = await supabase.from("candidato_especie").insert(payload)
  if (error) {
    resumen.errores.push({
      fuente: fuentesAportantes.join(", "),
      especie: nombreCientifico,
      error: error.message,
    })
    return resumen
  }

  if (tipoCambio === "nuevo") resumen.candidatosNuevos += 1
  else resumen.candidatosActualizacion += 1

  return resumen
}
