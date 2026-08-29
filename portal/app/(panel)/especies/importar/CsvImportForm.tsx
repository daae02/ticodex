"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { PixelIcon } from "@/components/PixelIcon"
import {
  validarCsvAction,
  confirmarImportAction,
  type EstadoPreviewCsv,
  type EstadoConfirmacionCsv,
} from "./actions"

const PREVIEW_INICIAL: EstadoPreviewCsv = { fase: "inicial" }

export function CsvImportForm() {
  const [preview, validarAction, validando] = useActionState(
    validarCsvAction,
    PREVIEW_INICIAL
  )
  const [confirmacion, confirmarAction, confirmando] = useActionState(
    confirmarImportAction,
    undefined as EstadoConfirmacionCsv | undefined
  )
  const [nombreArchivo, setNombreArchivo] = useState<string>("")

  if (confirmacion?.fase === "confirmado") {
    return (
      <div className="tarjeta stack">
        <p className="ok">
          Import confirmado: {confirmacion.insertadas} especie(s) creada(s) como
          borrador
          {confirmacion.fallidas ? `, ${confirmacion.fallidas} fila(s) con error` : ""}
          .
        </p>
        <div className="fila" style={{ gap: 8 }}>
          <Link href="/especies" className="btn btn-primary pixel">
            IR AL DASHBOARD
          </Link>
          <Link href="/importaciones" className="btn btn-outline pixel">
            VER HISTORIAL
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="stack">
      <form action={validarAction}>
        <label
          className="box lavender"
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {nombreArchivo || "arrastrá el archivo CSV aquí, o hacé click para buscarlo"}
          <input
            type="file"
            name="archivo"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={(e) => setNombreArchivo(e.target.files?.[0]?.name ?? "")}
            required
          />
        </label>
        <div style={{ marginTop: 10 }}>
          <button type="submit" className="btn btn-info pixel" disabled={validando}>
            {validando ? "VALIDANDO..." : "VALIDAR ARCHIVO"}
          </button>
        </div>
      </form>

      {preview.fase === "error" && <p className="err">{preview.error}</p>}

      {preview.fase === "preview" && preview.filas && (
        <div className="tarjeta stack">
          <div className="fila espaciada">
            <span style={{ fontWeight: 700 }}>Preview de validación</span>
            <span>
              <span className="ok">{preview.totalOk} OK</span>
              {" · "}
              <span className="err">{preview.totalError} con error</span>
            </span>
          </div>
          <table className="wtable">
            <thead>
              <tr>
                <th></th>
                <th>Fila</th>
                <th>Nombre común</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {preview.filas.map((fila) => (
                <tr key={fila.numeroFila}>
                  <td>
                    <PixelIcon
                      name={fila.ok ? "check" : "cross"}
                      className={fila.ok ? "green" : "danger"}
                      size={14}
                    />
                  </td>
                  <td>{fila.numeroFila}</td>
                  <td>{fila.nombreParaMostrar}</td>
                  <td>
                    {fila.ok ? (
                      <>
                        <span className="ok">OK</span>
                        {fila.avisos.length > 0 && (
                          <div className="aviso">{fila.avisos.join(" · ")}</div>
                        )}
                      </>
                    ) : (
                      <span className="err">{fila.errores.join(" · ")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {confirmacion?.fase === "error" && (
            <p className="err">{confirmacion.error}</p>
          )}

          <form action={confirmarAction}>
            <input type="hidden" name="csvText" value={preview.csvText} />
            <input
              type="hidden"
              name="nombreArchivo"
              value={preview.nombreArchivo}
            />
            <button
              type="submit"
              className="btn btn-primary pixel"
              disabled={confirmando || (preview.totalOk ?? 0) === 0}
            >
              {confirmando
                ? "IMPORTANDO..."
                : `CONFIRMAR IMPORT (${preview.totalOk ?? 0})`}
            </button>
          </form>
          <p className="aviso-texto">
            Solo se insertan las filas OK. Las filas con error no se importan —
            corregí el archivo y volvé a subirlo si hace falta incluirlas.
          </p>
        </div>
      )}
    </div>
  )
}
