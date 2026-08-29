import { NextResponse, type NextRequest } from "next/server"
import { refreshSupabaseSession } from "@/lib/supabase/proxySession"

// Convención Next.js 16: reemplaza a middleware.ts (ver
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
//
// El portal tiene dos superficies (PROYECTO.md §2.1, decisión 2026-08-28):
//  - Pública (catálogo real): todo lo que queda FUERA del grupo de rutas
//    `(panel)`. Se navega sin sesión.
//  - Interna (panel de carga): el grupo `(panel)` — hoy `/especies`,
//    `/revision`, `/fuentes`, `/importaciones` y sus subrutas — más las rutas
//    bajo `/api/*`. Exige sesión de Supabase Auth.
//
// Cualquier login exitoso es equipo interno (sin tabla de roles todavía).
// Un usuario ya logueado que visita `/login` es redirigido al panel.

// Prefijos de las páginas del grupo `(panel)`. Si se agrega una sección nueva
// al panel, sumá su prefijo acá (las rutas `/api/*` se cubren aparte).
const PREFIJOS_PANEL = ["/especies", "/revision", "/fuentes", "/importaciones"]

function esRutaPanel(pathname: string): boolean {
  return PREFIJOS_PANEL.some(
    (prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`)
  )
}

export async function proxy(request: NextRequest) {
  const { response, user } = await refreshSupabaseSession(request)

  const { pathname } = request.nextUrl
  const isLoginRoute = pathname === "/login"
  const isApiRoute = pathname.startsWith("/api/")
  const isPanelRoute = esRutaPanel(pathname)

  // Las rutas `/api/*` sirven exclusivamente al panel interno: sin sesión,
  // 401 (nunca redirect — son fetch/Server Actions, no navegación).
  if (!user && isApiRoute) {
    return NextResponse.json(
      { error: "No autenticado. Iniciá sesión de nuevo." },
      { status: 401 }
    )
  }

  // Páginas del panel: sin sesión, a /login guardando el destino.
  if (!user && isPanelRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  // Ya logueado y entra a /login: al panel.
  if (user && isLoginRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/especies"
    url.searchParams.delete("redirectTo")
    return NextResponse.redirect(url)
  }

  // Todo lo demás (superficie pública: `/`, `/especie/[id]`, ...) pasa sin
  // exigir sesión. El proxy igual refresca la cookie de Supabase para que,
  // si hay sesión, siga fresca al saltar al panel.
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
