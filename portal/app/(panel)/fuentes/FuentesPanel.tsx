"use client"

import { useActionState } from "react"
import { PixelIcon } from "@/components/PixelIcon"
import {
  buscarCandidatosAction,
  dispararScraperAction,
  type EstadoBusqueda,
  type EstadoScraper,
} from "./actions"

const ESTADO_BUSQUEDA_INICIAL: EstadoBusqueda = { candidatos: [] }
const ESTADO_SCRAPER_INICIAL: EstadoScraper = {}

/**
 * Buscador de especies (reemplaza el botón "Actualizar ahora" contra la
 * lista fija anterior — decisión 2026-08-10). El flujo es: el usuario
 * escribe un nombre, `buscarCandidatosAction` trae sugerencias de
 * iNaturalist/GBIF, el usuario elige UNA con el botón "Confirmar" de esa
 * tarjeta, y recién ahí `dispararScraperAction` corre el scraper (Wikipedia
 * ES+EN, iNaturalist, GBIF) para esa especie puntual, en segundo plano. El
 * scraper nunca elige una especie por su cuenta.
 */
export function FuentesPanel() {
  const [estadoBusqueda, buscarAction, buscando] = useActionState(
    buscarCandidatosAction,
    ESTADO_BUSQUEDA_INICIAL
  )
  const [estadoScraper, confirmarAction, confirmando] = useActionState(
    dispararScraperAction,
    ESTADO_SCRAPER_INICIAL
  )

  return (
    <div className="stack">
      <form action={buscarAction} className="stack" style={{ maxWidth: 480 }}>
        <label className="campo-label" htmlFor="q">
          Buscar especie (nombre común ES/EN o científico)
        </label>
        <div className="fila" style={{ gap: 8 }}>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={estadoBusqueda.query ?? ""}
            placeholder="ej. perezoso, sloth, Choloepus hoffmanni..."
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn btn-info pixel" disabled={buscando}>
            {buscando ? "BUSCANDO..." : "BUSCAR"}
          </button>
        </div>
      </form>

      {estadoBusqueda.error && <p className="err">{estadoBusqueda.error}</p>}

      {estadoBusqueda.query && !estadoBusqueda.error && estadoBusqueda.candidatos.length === 0 && (
        <p className="aviso-texto">
          Sin resultados para &quot;{estadoBusqueda.query}&quot; en iNaturalist/GBIF —
          probá con otro nombre (común en español, en inglés, o científico).
        </p>
      )}

      {estadoBusqueda.candidatos.length > 0 && (
        <div className="stack">
          <p className="aviso-texto">
            {estadoBusqueda.candidatos.length} candidato(s) para &quot;{estadoBusqueda.query}
            &quot; — elegí cuál es antes de traer los datos completos (un nombre común puede
            corresponder a más de una especie):
          </p>
          {estadoBusqueda.candidatos.map((c) => (
            <div
              key={c.nombreCientifico}
              className="tarjeta cream fila espaciada"
              style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}
            >
              <div className="fila" style={{ alignItems: "center", gap: 12 }}>
                {c.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.fotoUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="box"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="box" style={{ width: 48, height: 48 }} />
                )}
                <div className="columna" style={{ gap: 2 }}>
                  <span style={{ fontWeight: 700, fontStyle: "italic" }}>
                    {c.nombreCientifico}
                  </span>
                  <span className="aviso-texto">
                    ES: {c.nombreComunEs ?? "—"} · EN: {c.nombreComunEn ?? "—"}
                  </span>
                </div>
              </div>
              <form action={confirmarAction}>
                <input type="hidden" name="nombre_cientifico" value={c.nombreCientifico} />
                <button type="submit" className="btn btn-primary pixel" disabled={confirmando}>
                  <PixelIcon name="check" className="on-white" size={12} /> CONFIRMAR
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {estadoScraper.error && <p className="err">{estadoScraper.error}</p>}
      {estadoScraper.lanzado && (
        <p className="ok">
          Scraper lanzado en segundo plano para{" "}
          <strong style={{ fontStyle: "italic" }}>{estadoScraper.nombreCientifico}</strong> — no
          bloquea el panel. Si alguna fuente está habilitada, el candidato va a aparecer en la
          cola de revisión en unos segundos; recargá esta página o entrá a REVISIÓN para verlo.
        </p>
      )}
    </div>
  )
}
