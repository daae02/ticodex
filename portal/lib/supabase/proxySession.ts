import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"
import { supabasePublishableKey, supabaseUrl } from "./env"

/**
 * Refresca la sesión de Supabase en cada request y expone si hay un usuario
 * logueado. Se usa desde proxy.ts (reemplazo de middleware.js en Next 16) para
 * proteger las rutas del panel — ver PROYECTO.md §4 (equipo interno únicamente).
 */
export async function refreshSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    supabaseUrl(),
    supabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}
