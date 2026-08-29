import Link from "next/link"
import { createSupabaseServerClient, getUser } from "@/lib/supabase/server"
import { cerrarSesionAction } from "@/lib/supabase/authActions"

async function contarPendientes() {
  const supabase = await createSupabaseServerClient()
  const { count } = await supabase
    .from("candidato_especie")
    .select("id", { count: "exact", head: true })
    .eq("estado", "pendiente_revision")
  return count ?? 0
}

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, pendientes] = await Promise.all([getUser(), contarPendientes()])

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header className="topnav">
        <span className="marca pixel">TICODEX PANEL</span>
        <nav>
          <Link href="/especies">ESPECIES</Link>
          <Link href="/revision">
            REVISIÓN
            {pendientes > 0 && (
              <span className="badge-pendientes">{pendientes}</span>
            )}
          </Link>
          <Link href="/fuentes">FUENTES</Link>
          <Link href="/importaciones">IMPORTS</Link>
        </nav>
        <div className="fila" style={{ alignItems: "center", gap: 12 }}>
          <span
            className="aviso-texto"
            style={{ color: "var(--white)", opacity: 0.85 }}
          >
            {user?.email}
          </span>
          <form action={cerrarSesionAction}>
            <button type="submit" className="btn btn-outline btn-sm pixel">
              SALIR
            </button>
          </form>
        </div>
      </header>
      <main className="contenido" style={{ flex: 1, width: "100%" }}>
        {children}
      </main>
    </div>
  )
}
