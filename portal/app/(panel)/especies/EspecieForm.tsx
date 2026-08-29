"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import type { Tables } from "@/lib/database.types"
import { CLASE_TAXONOMICA_VALUES, ESTADO_CONSERVACION_VALUES } from "@/lib/csv/columns"
import {
  crearEspecieAction,
  actualizarEspecieAction,
  type EstadoFormularioEspecie,
} from "./actions"
import { FotosYSonido } from "./FotosYSonido"

const ESTADO_INICIAL: EstadoFormularioEspecie = {}

type EspecieExistente = Tables<"especie"> & {
  especie_foto: Tables<"especie_foto">[]
}

interface CamposFormulario {
  nombre_comun_es: string
  nombre_comun_en: string
  descripcion_es: string
  descripcion_en: string
  habitat_es: string
  habitat_en: string
  ubicacion_breve_es: string
  ubicacion_breve_en: string
  nombre_cientifico: string
  familia: string
  clase_taxonomica: string
  estado_conservacion: string
  endemica: boolean
  tiene_dimorfismo_sexual: boolean
  tiene_diferencia_juvenil: boolean
  atribucion_fuente: string
}

function valoresIniciales(especie?: EspecieExistente): CamposFormulario {
  return {
    nombre_comun_es: especie?.nombre_comun_es ?? "",
    nombre_comun_en: especie?.nombre_comun_en ?? "",
    descripcion_es: especie?.descripcion_es ?? "",
    descripcion_en: especie?.descripcion_en ?? "",
    habitat_es: especie?.habitat_es ?? "",
    habitat_en: especie?.habitat_en ?? "",
    ubicacion_breve_es: especie?.ubicacion_breve_es ?? "",
    ubicacion_breve_en: especie?.ubicacion_breve_en ?? "",
    nombre_cientifico: especie?.nombre_cientifico ?? "",
    familia: especie?.familia ?? "",
    clase_taxonomica: especie?.clase_taxonomica ?? "",
    estado_conservacion: especie?.estado_conservacion ?? "",
    endemica: especie?.endemica ?? false,
    tiene_dimorfismo_sexual: especie?.tiene_dimorfismo_sexual ?? false,
    tiene_diferencia_juvenil: especie?.tiene_diferencia_juvenil ?? false,
    atribucion_fuente: especie?.atribucion_fuente ?? "",
  }
}

export function EspecieForm({
  especie,
}: {
  especie?: EspecieExistente
}) {
  const modoEdicion = especie != null
  const accion = modoEdicion
    ? actualizarEspecieAction.bind(null, especie.id)
    : crearEspecieAction

  const [estado, formAction, enCurso] = useActionState(accion, ESTADO_INICIAL)

  // BUG conocido de React con <form action={...}> + useActionState: los
  // inputs no controlados (defaultValue) se resetean a su valor inicial
  // cuando la acción termina, sea éxito o error — si "Publicar" falla por el
  // gate de publicación, el usuario perdía todo lo que acababa de escribir.
  // Se arregla convirtiendo los campos en controlados: el estado se siembra
  // una sola vez desde `especie` (valoresIniciales) y solo se actualiza por
  // onChange — nunca por el resultado de la Server Action — así que
  // sobrevive intacto a un submit fallido.
  const [campos, setCampos] = useState<CamposFormulario>(() => valoresIniciales(especie))

  function actualizarCampo<K extends keyof CamposFormulario>(campo: K, valor: CamposFormulario[K]) {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
  }

  // Si ya trae un valor, asumimos que lo completó el orquestador al aprobar
  // un candidato (lib/scraper/orchestrator.ts + revision/actions.ts) y lo
  // dejamos de solo lectura por defecto — "EDITAR" lo desbloquea a mano. Si
  // viene vacío (especie 100% manual o nueva), es editable desde el inicio.
  const [editarAtribucion, setEditarAtribucion] = useState(!especie?.atribucion_fuente)

  // Campos puntuales que el gate de publicación (trigger de base de datos) o
  // la validación bilingüe reportaron como faltantes en el último intento —
  // se usan para marcar el input/label exacto, no solo el mensaje general de
  // arriba. Campos sin input en este formulario (ej. foto_hembra) solo
  // quedan en el texto de `estado.error`.
  const camposConError = new Set(estado.camposFaltantes ?? [])
  function claseError(campo: string) {
    return camposConError.has(campo) ? "campo-error" : undefined
  }
  function claseLabelError(campo: string) {
    return camposConError.has(campo) ? "campo-label campo-label-error" : "campo-label"
  }

  return (
    <div className="stack">
      <form action={formAction} className="stack">
        <div className="fila" style={{ gap: 24, flexWrap: "wrap" }}>
          <div className="columna" style={{ flex: 1, minWidth: 320 }}>
            <span
              className="chip"
              style={{ alignSelf: "flex-start", background: "var(--lavender)" }}
            >
              ESPAÑOL
            </span>
            <div className="columna">
              <label className={claseLabelError("nombre_comun_es")} htmlFor="nombre_comun_es">
                Nombre común (ES) *
              </label>
              <input
                id="nombre_comun_es"
                name="nombre_comun_es"
                type="text"
                className={claseError("nombre_comun_es")}
                value={campos.nombre_comun_es}
                onChange={(e) => actualizarCampo("nombre_comun_es", e.target.value)}
                required
              />
            </div>
            <div className="columna">
              <label className={claseLabelError("descripcion_es")} htmlFor="descripcion_es">
                Descripción (ES)
              </label>
              <textarea
                id="descripcion_es"
                name="descripcion_es"
                className={claseError("descripcion_es")}
                value={campos.descripcion_es}
                onChange={(e) => actualizarCampo("descripcion_es", e.target.value)}
              />
            </div>
            <div className="columna">
              <label className={claseLabelError("habitat_es")} htmlFor="habitat_es">
                Hábitat (ES)
              </label>
              <textarea
                id="habitat_es"
                name="habitat_es"
                className={claseError("habitat_es")}
                value={campos.habitat_es}
                onChange={(e) => actualizarCampo("habitat_es", e.target.value)}
              />
            </div>
            <div className="columna">
              <label className={claseLabelError("ubicacion_breve_es")} htmlFor="ubicacion_breve_es">
                Ubicación breve (ES)
              </label>
              <input
                id="ubicacion_breve_es"
                name="ubicacion_breve_es"
                type="text"
                className={claseError("ubicacion_breve_es")}
                value={campos.ubicacion_breve_es}
                onChange={(e) => actualizarCampo("ubicacion_breve_es", e.target.value)}
              />
            </div>
          </div>

          <div className="columna" style={{ flex: 1, minWidth: 320 }}>
            <span
              className="chip"
              style={{ alignSelf: "flex-start", background: "var(--lavender)" }}
            >
              ENGLISH
            </span>
            <div className="columna">
              <label className={claseLabelError("nombre_comun_en")} htmlFor="nombre_comun_en">
                Nombre común (EN)
              </label>
              <input
                id="nombre_comun_en"
                name="nombre_comun_en"
                type="text"
                className={claseError("nombre_comun_en")}
                value={campos.nombre_comun_en}
                onChange={(e) => actualizarCampo("nombre_comun_en", e.target.value)}
              />
            </div>
            <div className="columna">
              <label className={claseLabelError("descripcion_en")} htmlFor="descripcion_en">
                Descripción (EN)
              </label>
              <textarea
                id="descripcion_en"
                name="descripcion_en"
                className={claseError("descripcion_en")}
                value={campos.descripcion_en}
                onChange={(e) => actualizarCampo("descripcion_en", e.target.value)}
              />
            </div>
            <div className="columna">
              <label className={claseLabelError("habitat_en")} htmlFor="habitat_en">
                Hábitat (EN)
              </label>
              <textarea
                id="habitat_en"
                name="habitat_en"
                className={claseError("habitat_en")}
                value={campos.habitat_en}
                onChange={(e) => actualizarCampo("habitat_en", e.target.value)}
              />
            </div>
            <div className="columna">
              <label className={claseLabelError("ubicacion_breve_en")} htmlFor="ubicacion_breve_en">
                Ubicación breve (EN)
              </label>
              <input
                id="ubicacion_breve_en"
                name="ubicacion_breve_en"
                type="text"
                className={claseError("ubicacion_breve_en")}
                value={campos.ubicacion_breve_en}
                onChange={(e) => actualizarCampo("ubicacion_breve_en", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="fila" style={{ gap: 24, flexWrap: "wrap" }}>
          <div className="columna" style={{ flex: 1, minWidth: 220 }}>
            <label className={claseLabelError("nombre_cientifico")} htmlFor="nombre_cientifico">
              Nombre científico *
            </label>
            <input
              id="nombre_cientifico"
              name="nombre_cientifico"
              type="text"
              className={claseError("nombre_cientifico")}
              value={campos.nombre_cientifico}
              onChange={(e) => actualizarCampo("nombre_cientifico", e.target.value)}
              required
            />
          </div>
          <div className="columna" style={{ flex: 1, minWidth: 220 }}>
            <label className="campo-label" htmlFor="familia">
              Familia
            </label>
            <input
              id="familia"
              name="familia"
              type="text"
              value={campos.familia}
              onChange={(e) => actualizarCampo("familia", e.target.value)}
            />
          </div>
        </div>

        <div className="fila" style={{ gap: 24, flexWrap: "wrap" }}>
          <div className="columna" style={{ flex: 1, minWidth: 220 }}>
            <label className={claseLabelError("clase_taxonomica")} htmlFor="clase_taxonomica">
              Clase taxonómica *
            </label>
            <select
              id="clase_taxonomica"
              name="clase_taxonomica"
              className={claseError("clase_taxonomica")}
              value={campos.clase_taxonomica}
              onChange={(e) => actualizarCampo("clase_taxonomica", e.target.value)}
              required
            >
              <option value="" disabled>
                elegí una clase
              </option>
              {CLASE_TAXONOMICA_VALUES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="columna" style={{ flex: 1, minWidth: 220 }}>
            <label className={claseLabelError("estado_conservacion")} htmlFor="estado_conservacion">
              Estado de conservación (UICN)
            </label>
            <select
              id="estado_conservacion"
              name="estado_conservacion"
              className={claseError("estado_conservacion")}
              value={campos.estado_conservacion}
              onChange={(e) => actualizarCampo("estado_conservacion", e.target.value)}
            >
              <option value="">sin dato</option>
              {ESTADO_CONSERVACION_VALUES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="columna" style={{ justifyContent: "flex-end" }}>
            <label
              className="campo-label"
              htmlFor="endemica"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <input
                id="endemica"
                name="endemica"
                type="checkbox"
                style={{ width: "auto" }}
                checked={campos.endemica}
                onChange={(e) => actualizarCampo("endemica", e.target.checked)}
              />
              Endémica
            </label>
          </div>
        </div>

        <div className="columna">
          <label
            className="campo-label"
            htmlFor="tiene_dimorfismo_sexual"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <input
              id="tiene_dimorfismo_sexual"
              name="tiene_dimorfismo_sexual"
              type="checkbox"
              style={{ width: "auto" }}
              checked={campos.tiene_dimorfismo_sexual}
              onChange={(e) => actualizarCampo("tiene_dimorfismo_sexual", e.target.checked)}
            />
            ¿Tiene dimorfismo sexual (macho/hembra distintos)?
          </label>
          <label
            className="campo-label"
            htmlFor="tiene_diferencia_juvenil"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <input
              id="tiene_diferencia_juvenil"
              name="tiene_diferencia_juvenil"
              type="checkbox"
              style={{ width: "auto" }}
              checked={campos.tiene_diferencia_juvenil}
              onChange={(e) => actualizarCampo("tiene_diferencia_juvenil", e.target.checked)}
            />
            ¿El juvenil se ve distinto al adulto?
          </label>
          <p className="aviso-texto">
            Marcá estas dos casillas según corresponda antes de publicar: si
            quedan tildadas, la especie no se puede publicar sin las fotos de
            macho/hembra y/o juvenil correspondientes (lo exige un trigger en
            la base de datos, no solo este formulario). Los slots de foto de
            abajo aparecen y desaparecen al toque según lo que marques acá. No
            afectan a &quot;Guardar borrador&quot;.
          </p>
        </div>

        <div className="columna">
          <label className="campo-label" htmlFor="atribucion_fuente">
            Atribución de fuente
          </label>
          <div className="fila" style={{ gap: 8, alignItems: "center" }}>
            <input
              id="atribucion_fuente"
              name="atribucion_fuente"
              type="text"
              placeholder="ej. Datos: Wikipedia (CC-BY-SA), GBIF"
              value={campos.atribucion_fuente}
              onChange={(e) => actualizarCampo("atribucion_fuente", e.target.value)}
              readOnly={!editarAtribucion}
              style={!editarAtribucion ? { background: "var(--cream)" } : undefined}
            />
            {!editarAtribucion && (
              <button
                type="button"
                className="btn btn-outline pixel"
                onClick={() => setEditarAtribucion(true)}
              >
                EDITAR
              </button>
            )}
          </div>
          <p className="aviso-texto">
            Se completa solo cuando se aprueba un candidato con datos de
            fuentes que exigen atribución visible (Wikipedia, GBIF,
            iNaturalist) y se muestra en la ficha pública cuando no está
            vacío. Si la especie es 100% manual, dejalo vacío.
          </p>
        </div>

        {estado.error && <p className="err">{estado.error}</p>}
        {estado.ok && <p className="ok">Guardado.</p>}

        <div className="fila" style={{ gap: 8 }}>
          <button
            type="submit"
            name="intent"
            value="borrador"
            className="btn btn-outline pixel"
            disabled={enCurso}
          >
            GUARDAR BORRADOR
          </button>
          <button
            type="submit"
            name="intent"
            value="publicar"
            className="btn btn-primary pixel"
            disabled={enCurso}
          >
            PUBLICAR
          </button>
          {modoEdicion && especie.estado_publicacion === "publicado" && (
            <button
              type="submit"
              name="intent"
              value="despublicar"
              className="btn btn-accent pixel"
              disabled={enCurso}
            >
              DESPUBLICAR
            </button>
          )}
          <Link href="/especies" className="btn btn-outline pixel">
            VOLVER
          </Link>
        </div>
      </form>

      {modoEdicion ? (
        <FotosYSonido
          especieId={especie.id}
          fotos={especie.especie_foto}
          sonidoUrl={especie.sonido_url}
          tieneDimorfismoSexual={campos.tiene_dimorfismo_sexual}
          tieneDiferenciaJuvenil={campos.tiene_diferencia_juvenil}
        />
      ) : (
        <p className="aviso-texto">
          Las fotos por tipo y el sonido se cargan después de guardar los datos
          básicos (necesitan que la especie ya exista).
        </p>
      )}
    </div>
  )
}
