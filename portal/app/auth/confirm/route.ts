import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Destino del enlace de "restablecer contraseña" que envía Supabase Auth
 * (ver resetPasswordForEmail en app/login/olvide/actions.ts). Supabase
 * agrega `?code=` a esta URL; lo canjeamos por una sesión (de solo
 * recuperación) antes de mandar al usuario a fijar la contraseña nueva.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/login/restablecer"

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  const url = new URL("/login", origin)
  url.searchParams.set(
    "error",
    "El enlace de recuperación no es válido o expiró. Pedí uno nuevo."
  )
  return NextResponse.redirect(url)
}
