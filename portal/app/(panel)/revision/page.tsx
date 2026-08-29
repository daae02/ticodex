import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { parseCamposPropuestos, conCamposManualesSiempreVisibles } from "@/lib/scraper/diff"
import { CandidatoCard } from "./CandidatoCard"

export const metadata = { title: "Cola de revisión — Ticodex Panel" }

async function cargarCandidatos() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("candidato_especie")
    .select(
      "id, tipo_cambio, fuente, creado_en, campos_propuestos, especie(nombre_comun_es, nombre_comun_en, habitat_es, habitat_en, ubicacion_breve_es, ubicacion_breve_en)"
    )
    .eq("estado", "pendiente_revision")
    .order("creado_en", { ascending: true })

  if (error) throw error
  return data
}

export default async function RevisionPage() {
  const candidatos = await cargarCandidatos()
  const nuevos = candidatos.filter((c) => c.tipo_cambio === "nuevo")
  const actualizaciones = candidatos.filter((c) => c.tipo_cambio === "actualizacion")

  return (
    <div className="stack">
      <h1 className="pixel" style={{ fontSize: 16 }}>
        COLA DE REVISIÓN
      </h1>
      <p className="aviso-texto">
        Nada llega a la lista pública sin pasar por acá. Para actualizaciones
        se muestra el valor actual tachado junto al propuesto — revisalo
        antes de aprobar. Podés editar cualquier campo antes de confirmar, o
        descartar el candidato.
      </p>

      {candidatos.length === 0 && (
        <div className="tarjeta stack">
          <p className="aviso-texto">No hay candidatos pendientes de revisión.</p>
          <Link href="/fuentes" className="btn btn-outline pixel" style={{ width: 220 }}>
            IR A ACTUALIZAR DESDE FUENTES
          </Link>
        </div>
      )}

      {nuevos.length > 0 && (
        <div className="stack">
          <span className="pixel" style={{ fontSize: 12 }}>
            NUEVOS ({nuevos.length})
          </span>
          {nuevos.map((c) => (
            <CandidatoCard
              key={c.id}
              candidato={c}
              diff={conCamposManualesSiempreVisibles(parseCamposPropuestos(c.campos_propuestos), null)}
              nombreActual={null}
            />
          ))}
        </div>
      )}

      {actualizaciones.length > 0 && (
        <div className="stack">
          <span className="pixel" style={{ fontSize: 12 }}>
            ACTUALIZACIONES ({actualizaciones.length})
          </span>
          {actualizaciones.map((c) => (
            <CandidatoCard
              key={c.id}
              candidato={c}
              diff={conCamposManualesSiempreVisibles(
                parseCamposPropuestos(c.campos_propuestos),
                c.especie
              )}
              nombreActual={c.especie?.nombre_comun_es ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
