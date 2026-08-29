"use client"

import { useActionState } from "react"
import { iniciarSesionAction, type EstadoLogin } from "./actions"

const ESTADO_INICIAL: EstadoLogin = {}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [estado, formAction, enCurso] = useActionState(
    iniciarSesionAction,
    ESTADO_INICIAL
  )

  return (
    <form action={formAction} className="stack" style={{ width: 260 }}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
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
      <div className="columna">
        <label className="campo-label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
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
        {enCurso ? "INGRESANDO..." : "INGRESAR"}
      </button>
      <p className="aviso-texto" style={{ textAlign: "center" }}>
        Acceso restringido al equipo interno
      </p>
    </form>
  )
}
