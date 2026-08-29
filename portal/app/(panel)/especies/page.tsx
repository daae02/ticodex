import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { PixelIcon } from "@/components/PixelIcon"

type FiltroEstado = "todos" | "borrador" | "publicado"

function esFiltroValido(v: string | undefined): v is FiltroEstado {
  return v === "todos" || v === "borrador" || v === "publicado"
}

async function cargarEspecies(filtro: FiltroEstado) {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("especie")
    .select(
      "id, nombre_comun_es, nombre_comun_en, nombre_cientifico, estado_publicacion, estado_conservacion, especie_foto(url, es_principal)"
    )
    .order("creado_en", { ascending: false })

  if (filtro !== "todos") {
    query = query.eq("estado_publicacion", filtro)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

async function contarCandidatosPendientes() {
  const supabase = await createSupabaseServerClient()
  const { count } = await supabase
    .from("candidato_especie")
    .select("id", { count: "exact", head: true })
    .eq("estado", "pendiente_revision")
  return count ?? 0
}

function fotoPrincipal(
  fotos: { url: string; es_principal: boolean }[] | null
) {
  if (!fotos || fotos.length === 0) return null
  return fotos.find((f) => f.es_principal)?.url ?? fotos[0].url
}

const TABS: { valor: FiltroEstado; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "TODOS" },
  { valor: "publicado", etiqueta: "PUBLICADO" },
  { valor: "borrador", etiqueta: "BORRADOR" },
]

export default async function EspeciesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado } = await searchParams
  const filtro: FiltroEstado = esFiltroValido(estado) ? estado : "todos"

  const [especies, pendientes] = await Promise.all([
    cargarEspecies(filtro),
    contarCandidatosPendientes(),
  ])

  return (
    <div className="stack">
      <div className="fila espaciada">
        <h1 className="pixel" style={{ fontSize: 16 }}>
          ESPECIES
        </h1>
        <div className="fila" style={{ gap: 8 }}>
          <a href="/api/plantilla-csv" className="btn btn-outline pixel">
            PLANTILLA CSV
          </a>
          <Link href="/especies/importar" className="btn btn-outline pixel">
            SUBIR CSV
          </Link>
          <Link href="/especies/nueva" className="btn btn-primary pixel">
            + NUEVA
          </Link>
        </div>
      </div>

      <div className="fila" style={{ gap: 4 }}>
        {TABS.map((tab) => (
          <Link
            key={tab.valor}
            href={tab.valor === "todos" ? "/especies" : `/especies?estado=${tab.valor}`}
            className={`chip pixel${filtro === tab.valor ? " activo" : ""}`}
            style={{
              padding: "8px 12px",
              fontSize: 9,
              background:
                filtro === tab.valor ? "var(--ink)" : "var(--white)",
              color: filtro === tab.valor ? "var(--white)" : "var(--ink)",
            }}
          >
            {tab.etiqueta}
          </Link>
        ))}
      </div>

      <table className="wtable">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nombre común</th>
            <th>Científico</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {especies.length === 0 && pendientes === 0 && (
            <tr>
              <td colSpan={4} className="aviso-texto">
                Todavía no hay especies cargadas. Usá &quot;+ NUEVA&quot;, &quot;SUBIR
                CSV&quot; o &quot;FUENTES&quot; para empezar.
              </td>
            </tr>
          )}
          {especies.map((especie) => {
            const foto = fotoPrincipal(especie.especie_foto)
            return (
              <tr key={especie.id}>
                <td>
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={foto}
                      alt=""
                      width={28}
                      height={28}
                      style={{
                        objectFit: "cover",
                        border: "2px solid var(--ink)",
                      }}
                    />
                  ) : (
                    <PixelIcon name="photo" />
                  )}
                </td>
                <td>
                  <Link href={`/especies/${especie.id}/editar`}>
                    {especie.nombre_comun_es}
                    {especie.nombre_comun_en ? ` / ${especie.nombre_comun_en}` : ""}
                  </Link>
                </td>
                <td>
                  <i>{especie.nombre_cientifico}</i>
                </td>
                <td>
                  <span
                    className={`status-pill ${
                      especie.estado_publicacion === "publicado"
                        ? "status-pub"
                        : "status-draft"
                    }`}
                  >
                    {especie.estado_publicacion.toUpperCase()}
                  </span>
                </td>
              </tr>
            )
          })}
          {filtro !== "borrador" && pendientes > 0 && (
            <tr>
              <td>
                <PixelIcon name="photo" />
              </td>
              <td colSpan={2}>
                <Link href="/revision">
                  — ({pendientes} candidato{pendientes === 1 ? "" : "s"} pendiente
                  {pendientes === 1 ? "" : "s"} de revisión)
                </Link>
              </td>
              <td>
                <span className="status-pill status-pending">EN REVISIÓN</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
