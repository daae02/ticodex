import "server-only"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"
import { supabasePublishableKey, supabaseUrl } from "./env"

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 * Usa la sesión (cookies) del usuario logueado — nunca una service role key.
 * Toda escritura queda sujeta a las políticas RLS definidas por
 * `backend-supabase` (ver PROYECTO.md §5 / .claude/agents/backend-supabase.md).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Se llama desde un Server Component (no puede escribir cookies).
          // El proxy (proxy.ts) se encarga de refrescar la sesión en ese caso.
        }
      },
    },
  })
}

/** Devuelve el usuario logueado o null. No redirige. */
export async function getUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Para usar al principio de cada Server Action / Route Handler que escribe
 * datos: nunca confiamos en que el proxy ya filtró la request (ver nota de
 * seguridad de Next.js sobre Server Actions como endpoints alcanzables
 * directamente).
 */
export async function requireUser() {
  const user = await getUser()
  if (!user) {
    throw new Error("No autenticado. Iniciá sesión de nuevo.")
  }
  return user
}
