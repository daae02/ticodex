import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { FUENTES_CONFIGURADAS } from "@/lib/scraper/config"
import { FuentesPanel } from "./FuentesPanel"

export const metadata = { title: "Actualizar desde fuentes — Ticodex Panel" }

async function cargarEstadisticas() {
  const supabase = await createSupabaseServerClient()

  const [{ count: pendientesNuevos }, { count: pendientesActualizacion }, ultimoRes] =
    await Promise.all([
      supabase
        .from("candidato_especie")
        .select("id", { count: "exact", head: true })
        .eq("estado", "pendiente_revision")
        .eq("tipo_cambio", "nuevo"),
      supabase
        .from("candidato_especie")
        .select("id", { count: "exact", head: true })
        .eq("estado", "pendiente_revision")
        .eq("tipo_cambio", "actualizacion"),
      supabase
        .from("candidato_especie")
        .select("creado_en")
        .order("creado_en", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  return {
    pendientesNuevos: pendientesNuevos ?? 0,
    pendientesActualizacion: pendientesActualizacion ?? 0,
    ultimaActividad: ultimoRes.data?.creado_en ?? null,
  }
}

export default async function FuentesPage() {
  const stats = await cargarEstadisticas()
  const habilitadas = FUENTES_CONFIGURADAS.filter((f) => f.licenciaConfirmada)

  return (
    <div className="stack">
      <h1 className="pixel" style={{ fontSize: 16 }}>
        ACTUALIZAR DESDE FUENTES
      </h1>

      <div className="tarjeta cream stack">
        <div style={{ fontWeight: 700, fontSize: 13 }}>
          Fuentes configuradas: {FUENTES_CONFIGURADAS.map((f) => f.nombre).join(" · ")}
        </div>
        <p className="aviso-texto">
          Configuración fija de esta iteración a nivel de fuente — elegir qué
          fuentes/campos usar por corrida es Fase 5 del roadmap. El scraper
          nunca elige una especie por su cuenta: buscá un nombre abajo,
          confirmá cuál de los candidatos es, y recién ahí se corre contra
          esa especie puntual.
        </p>

        <table className="wtable">
          <thead>
            <tr>
              <th>Fuente</th>
              <th>Estado</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {FUENTES_CONFIGURADAS.map((f) => (
              <tr key={f.nombre}>
                <td>{f.nombre}</td>
                <td>
                  <span
                    className={`status-pill ${
                      f.licenciaConfirmada ? "status-pub" : "status-pending"
                    }`}
                  >
                    {f.licenciaConfirmada ? "ACTIVA" : "BLOQUEADA"}
                  </span>
                </td>
                <td className="aviso-texto">
                  {f.licenciaConfirmada
                    ? "Licencia/ToS de redistribución confirmada."
                    : f.motivoLicencia}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {habilitadas.length === 0 && (
          <p className="aviso" style={{ margin: 0 }}>
            Ninguna fuente está habilitada todavía — falta confirmar
            licencia/ToS de redistribución de cada una (ver tabla arriba). El
            buscador de abajo funciona igual, pero confirmar un candidato no
            va a generar filas en la cola hasta que se habilite al menos una
            fuente en <code>lib/scraper/config.ts</code>.
          </p>
        )}
      </div>

      <FuentesPanel />

      <p className="aviso-texto">
        Última actividad del scraper:{" "}
        {stats.ultimaActividad
          ? new Date(stats.ultimaActividad).toLocaleString("es-CR", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "todavía no corrió"}
        {" · "}
        {stats.pendientesNuevos} nuevo(s) y {stats.pendientesActualizacion}{" "}
        actualización(es) esperando en la{" "}
        <Link href="/revision">cola de revisión</Link>.
      </p>
    </div>
  )
}
