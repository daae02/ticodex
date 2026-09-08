"use client"

import { useActionState } from "react"
import { actualizarContrasenaAction, type EstadoRestablecer } from "./actions"

const ESTADO_INICIAL: EstadoRestablecer = {}

export function RestablecerForm() {
  const [estado, formAction, enCurso] = useActionState(
    actualizarContrasenaAction,
    ESTADO_INICIAL
  )

  return (
    <form action={formAction} className="stack" style={{ width: 260 }}>
      <div className="columna">
        <label className="campo-label" htmlFor="password">
          Contraseña nueva
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={6}
          required
        />
      </div>
      <div className="columna">
        <label className="campo-label" htmlFor="confirmar">
          Confirmar contraseña
        </label>
        <input
          id="confirmar"
          name="confirmar"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={6}
          required
        />
      </div>
      {estado.error && <p className="err">{estado.error}</p>}
      <button
        type="submit"
        className="btn btn-primary pixel"
        disabled={enCurso}
        style={{ width: "100%" }}
      >
        {enCurso ? "GUARDANDO..." : "GUARDAR CONTRASEÑA"}
      </button>
    </form>
  )
}
