"use server"

import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export interface EstadoOlvide {
  ok?: boolean
  error?: string
}

/**
 * Siempre devuelve ok (nunca revela si el correo existe en el sistema,
 * incluso si Supabase devuelve error) — evita enumeración de cuentas.
 */
export async function solicitarRecuperacionAction(
  _prevState: EstadoOlvide,
  formData: FormData
): Promise<EstadoOlvide> {
  const email = String(formData.get("email") ?? "").trim()

  if (!email) {
    return { error: "Ingresá tu correo." }
  }

  const encabezados = await headers()
  const proto = encabezados.get("x-forwarded-proto") ?? "http"
  const host = encabezados.get("host")
  const origen = `${proto}://${host}`

  const supabase = await createSupabaseServerClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origen}/auth/confirm?next=/login/restablecer`,
  })

  return { ok: true }
}
