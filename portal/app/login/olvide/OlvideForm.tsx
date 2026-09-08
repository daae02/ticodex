"use client"

import { useActionState } from "react"
import { solicitarRecuperacionAction, type EstadoOlvide } from "./actions"

const ESTADO_INICIAL: EstadoOlvide = {}

export function OlvideForm() {
  const [estado, formAction, enCurso] = useActionState(
    solicitarRecuperacionAction,
    ESTADO_INICIAL
  )

  if (estado.ok) {
    return (
      <p className="ok" style={{ textAlign: "center", maxWidth: 260 }}>
        Si el correo tiene una cuenta, te enviamos un enlace para restablecer
        la contraseña.
      </p>
    )
  }

  return (
    <form action={formAction} className="stack" style={{ width: 260 }}>
      <div className="columna">
        <label className="campo-label" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="correo@ticodex.internal"
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
        {enCurso ? "ENVIANDO..." : "ENVIAR ENLACE"}
      </button>
      <p className="aviso-texto" style={{ textAlign: "center" }}>
        <a href="/login">Volver a ingresar</a>
      </p>
    </form>
  )
}
