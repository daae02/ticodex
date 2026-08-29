"use client"

import { useActionState, useState } from "react"
import { PixelIcon } from "@/components/PixelIcon"
import { CLASE_TAXONOMICA_VALUES, ESTADO_CONSERVACION_VALUES } from "@/lib/csv/columns"
import type { CampoDiff } from "@/lib/scraper/diff"
import { resolverCandidatoAction, type EstadoCandidato } from "./actions"

const ESTADO_INICIAL: EstadoCandidato = {}

const ETIQUETAS: Record<string, string> = {
  nombre_comun_es: "Nombre común (ES)",
  nombre_comun_en: "Nombre común (EN)",
  nombre_cientifico: "Nombre científico",
  clase_taxonomica: "Clase taxonómica",
  familia: "Familia",
  descripcion_es: "Descripción (ES)",
  descripcion_en: "Descripción (EN)",
  habitat_es: "Hábitat (ES)",
  habitat_en: "Hábitat (EN)",
  ubicacion_breve_es: "Ubicación breve (ES)",
  ubicacion_breve_en: "Ubicación breve (EN)",
  estado_conservacion: "Estado de conservación (UICN)",
  atribucion_fuente: "Atribución de fuente",
}

// habitat_es/en y ubicacion_breve_es/en no los provee ninguna fuente del
// scraper — se agregan igual (ver conCamposManualesSiempreVisibles en
// lib/scraper/diff.ts, que ya los siembra en `diff` con el valor actual de
// la especie cuando es una actualización, o vacío cuando es "nuevo") para
// que el equipo los complete ahí mismo al aprobar en vez de tener que ir
// después al formulario de la especie.
const ORDEN_CAMPOS = [
  "nombre_comun_es",
  "nombre_comun_en",
  "nombre_cientifico",
  "clase_taxonomica",
  "familia",
  "descripcion_es",
  "descripcion_en",
  "habitat_es",
  "habitat_en",
  "ubicacion_breve_es",
  "ubicacion_breve_en",
  "estado_conservacion",
  "atribucion_fuente",
] as const

/** Estos dos no son columnas de `especie` — son la foto candidata que puede
 * traer iNaturalist (ver lib/scraper/types.ts). Se muestran aparte, de solo
 * lectura: nunca se aplican solas al aprobar, el equipo las revisa y sube la
 * foto a mano desde el formulario de la especie si le sirve. */
const CAMPO_FOTO_URL = "foto_adulto_candidata_url"
const CAMPO_FOTO_ATRIBUCION = "foto_adulto_candidata_atribucion"

const OBLIGATORIOS_SI_NUEVO = new Set(["nombre_comun_es", "nombre_cientifico", "clase_taxonomica"])

/**
 * `candidato_especie.fuente` ahora es una lista de fuentes que fusionaron
 * datos en ESTE candidato (ver lib/scraper/orchestrator.ts, fix bug
 * 2026-08-10: antes era una fila por fuente, ahora es una fuente
 * "Wikipedia especies, iNaturalist, GBIF" por candidato). Se muestra como
 * chips en vez de un solo string plano para que quede claro que puede venir
 * de varias fuentes a la vez, sin romper el layout cuando es una sola.
 */
function FuentesDelCandidato({ fuente }: { fuente: string }) {
  const lista = fuente
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)

  if (lista.length === 0) return null

  return (
    <span className="fila" style={{ gap: 4, flexWrap: "wrap", alignItems: "center" }}>
      <span className="aviso-texto">{lista.length > 1 ? "fuentes:" : "fuente:"}</span>
      {lista.map((f) => (
        <span key={f} className="chip" style={{ padding: "2px 6px" }}>
          {f}
        </span>
      ))}
    </span>
  )
}

export function CandidatoCard({
  candidato,
  diff,
  nombreActual,
}: {
  candidato: {
    id: string
    tipo_cambio: "nuevo" | "actualizacion"
    fuente: string
    creado_en: string
  }
  diff: Record<string, CampoDiff>
  nombreActual: string | null
}) {
  const accion = resolverCandidatoAction.bind(null, candidato.id)
  const [estado, formAction, enCurso] = useActionState(accion, ESTADO_INICIAL)

  const esNuevo = candidato.tipo_cambio === "nuevo"
  // Para "nuevo" siempre se ofrecen los 3 campos obligatorios del esquema
  // (nombre_comun_es, nombre_cientifico, clase_taxonomica) aunque la fuente
  // no los haya propuesto — sin eso no se puede crear la fila en `especie`.
  const camposAMostrar = esNuevo
    ? ORDEN_CAMPOS
    : ORDEN_CAMPOS.filter((campo) => campo in diff)

  // Mismo bug de React que EspecieForm.tsx: con <form action={...}> +
  // useActionState, los inputs no controlados (defaultValue) se resetean a
  // su valor propuesto original cuando la acción termina, incluso si falló
  // — el equipo perdía cualquier edición hecha antes de "Aprobar". Se arregla
  // con inputs controlados: el estado se siembra una sola vez desde `diff` y
  // solo se actualiza por onChange, nunca por el resultado de la acción.
  const [valores, setValores] = useState<Record<string, string>>(() =>
    Object.fromEntries(camposAMostrar.map((campo) => [campo, diff[campo]?.propuesto ?? ""]))
  )

  function actualizarValor(campo: string, valor: string) {
    setValores((prev) => ({ ...prev, [campo]: valor }))
  }

  if (estado.ok) {
    return (
      <div className="tarjeta stack">
        <p className="ok">Candidato procesado.</p>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className={`tarjeta ${esNuevo ? "cream" : "lavender"} stack`}
    >
      <div className="fila espaciada" style={{ flexWrap: "wrap" }}>
        <span className="chip">{esNuevo ? "NUEVO" : "ACTUALIZACIÓN"}</span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>
          {nombreActual ??
            diff.nombre_comun_es?.propuesto ??
            diff.nombre_cientifico?.propuesto ??
            "—"}
        </span>
        <FuentesDelCandidato fuente={candidato.fuente} />
      </div>

      <div className="diffbox stack">
        {camposAMostrar.map((campo) => {
          const entrada = diff[campo]
          const obligatorio = esNuevo && OBLIGATORIOS_SI_NUEVO.has(campo)
          const valor = valores[campo] ?? ""
          return (
            <div key={campo} className="columna">
              <label className="campo-label">
                {ETIQUETAS[campo]}
                {obligatorio ? " *" : ""}
              </label>
              {entrada?.actual != null && entrada.actual !== "" && (
                <div>
                  <span className="campo">actual: </span>
                  <span className="old">{entrada.actual}</span>
                  <span> {"->"} </span>
                </div>
              )}
              {campo === "clase_taxonomica" ? (
                <select
                  name={`campo__${campo}`}
                  value={valor}
                  onChange={(e) => actualizarValor(campo, e.target.value)}
                  required={obligatorio}
                >
                  <option value="" disabled={obligatorio}>
                    elegí una clase
                  </option>
                  {CLASE_TAXONOMICA_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : campo === "estado_conservacion" ? (
                <select
                  name={`campo__${campo}`}
                  value={valor}
                  onChange={(e) => actualizarValor(campo, e.target.value)}
                >
                  <option value="">sin dato</option>
                  {ESTADO_CONSERVACION_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : campo.startsWith("descripcion") || campo.startsWith("habitat") ? (
                <textarea
                  name={`campo__${campo}`}
                  value={valor}
                  onChange={(e) => actualizarValor(campo, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  name={`campo__${campo}`}
                  value={valor}
                  onChange={(e) => actualizarValor(campo, e.target.value)}
                  required={obligatorio}
                />
              )}
            </div>
          )
        })}
      </div>

      {diff[CAMPO_FOTO_URL] && (
        <div className="columna" style={{ gap: 4 }}>
          <label className="campo-label">
            Sugerencia de foto (tipo adulto) — revisar y subir a mano
          </label>
          <div className="fila" style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={diff[CAMPO_FOTO_URL].propuesto}
              alt="Foto candidata sugerida por la fuente"
              style={{ width: 120, height: 90, objectFit: "cover" }}
              className="box"
            />
            <div className="columna" style={{ gap: 4 }}>
              <a
                href={diff[CAMPO_FOTO_URL].propuesto}
                target="_blank"
                rel="noreferrer"
                className="aviso-texto"
              >
                Abrir imagen en tamaño completo
              </a>
              {diff[CAMPO_FOTO_ATRIBUCION] && (
                <span className="aviso-texto">
                  Atribución: {diff[CAMPO_FOTO_ATRIBUCION].propuesto}
                </span>
              )}
              <span className="aviso-texto">
                No se aplica sola al aprobar — si sirve, descargala y subila
                como foto &quot;ADULTO&quot; desde el formulario de la
                especie.
              </span>
            </div>
          </div>
        </div>
      )}

      {estado.error && <p className="err">{estado.error}</p>}

      <div className="fila" style={{ gap: 8 }}>
        <button
          type="submit"
          name="intent"
          value="aprobar"
          className="btn btn-primary pixel"
          disabled={enCurso}
        >
          <PixelIcon name="check" className="on-white" size={12} /> APROBAR
        </button>
        <button
          type="submit"
          name="intent"
          value="descartar"
          className="btn btn-outline pixel"
          disabled={enCurso}
          formNoValidate
        >
          <PixelIcon name="cross" size={12} /> DESCARTAR
        </button>
      </div>
    </form>
  )
}
