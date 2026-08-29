"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export interface EstadoLogin {
  error?: string
}

/**
 * Login del equipo interno (PROYECTO.md §4): sin registro público, las
 * cuentas se crean a mano desde el dashboard de Supabase Auth. Quien tiene
 * una cuenta puede operar el panel entero — no hay flujo de aprobación
 * externo en esta fase.
 */
export async function iniciarSesionAction(
  _prevState: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const redirectTo = String(formData.get("redirectTo") ?? "/especies")

  if (!email || !password) {
    return { error: "Ingresá correo y contraseña." }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "Correo o contraseña incorrectos." }
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/especies")
}
