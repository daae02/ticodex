import { createSupabaseServerClient } from "@/lib/supabase/server"

export const metadata = { title: "Historial de importaciones — Ticodex Panel" }

async function cargarImportJobs() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("import_job")
    .select("id, creado_en, filas_totales, filas_ok, filas_error, archivo_csv_url, log_errores")
    .order("creado_en", { ascending: false })

  if (error) throw error
  return data
}

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" })
}

interface LogErrorFila {
  fila: number
  errores: string[]
}

function esLogErrorFila(v: unknown): v is LogErrorFila {
  return (
    typeof v === "object" &&
    v !== null &&
    "fila" in v &&
    "errores" in v &&
    Array.isArray((v as LogErrorFila).errores)
  )
}

export default async function ImportacionesPage() {
  const jobs = await cargarImportJobs()

  return (
    <div className="stack">
      <h1 className="pixel" style={{ fontSize: 16 }}>
        HISTORIAL DE IMPORTACIONES
      </h1>
      <p className="aviso-texto">
        Cada import de CSV queda registrado acá para trazabilidad — incluidas
        las filas que fallaron y por qué (import_job).
      </p>

      {jobs.length === 0 ? (
        <div className="tarjeta">
          <p className="aviso-texto">Todavía no se hizo ningún import de CSV.</p>
        </div>
      ) : (
        <table className="wtable">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Filas totales</th>
              <th>OK</th>
              <th>Error</th>
              <th>Archivo</th>
              <th>Detalle de errores</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const errores = Array.isArray(job.log_errores)
                ? (job.log_errores as unknown[]).filter(esLogErrorFila)
                : []
              return (
                <tr key={job.id}>
                  <td>{formatearFecha(job.creado_en)}</td>
                  <td>{job.filas_totales}</td>
                  <td className="ok">{job.filas_ok}</td>
                  <td className={job.filas_error > 0 ? "err" : ""}>{job.filas_error}</td>
                  <td>
                    {job.archivo_csv_url ? (
                      <a href={job.archivo_csv_url} target="_blank" rel="noreferrer">
                        descargar
                      </a>
                    ) : (
                      <span className="aviso-texto">—</span>
                    )}
                  </td>
                  <td>
                    {errores.length > 0 ? (
                      <details>
                        <summary style={{ cursor: "pointer" }}>
                          {errores.length} error(es)
                        </summary>
                        <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                          {errores.map((e, i) => (
                            <li key={i} className="aviso-texto">
                              fila {e.fila}: {e.errores.join(" · ")}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <span className="ok">sin errores</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
