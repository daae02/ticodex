import { cache } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { FichaEspecie } from "@/components/publico/FichaEspecie"

export const dynamic = "force-dynamic"

// `cache` dedupe: la página y `generateMetadata` piden la misma especie en
// el mismo request → una sola query a Supabase.
const cargarEspeciePublicada = cache(async (id: string) => {
  const supabase = await createSupabaseServerClient()
  // `.eq("estado_publicacion", "publicado")`: aunque la RLS anónima ya lo
  // garantiza, dejamos explícito que la superficie pública SOLO muestra
  // publicado — nunca borradores ni candidatos.
  const { data, error } = await supabase
    .from("especie")
    .select("*, especie_foto(*)")
    .eq("id", id)
    .eq("estado_publicacion", "publicado")
    .maybeSingle()

  if (error) throw error
  return data
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const especie = await cargarEspeciePublicada(id)
  if (!especie) return { title: "Especie no encontrada — Ticodex" }
  return {
    title: `${especie.nombre_comun_es} (${especie.nombre_cientifico}) — Ticodex`,
    description: especie.descripcion_es ?? especie.descripcion_en ?? undefined,
  }
}

export default async function FichaEspeciePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const especie = await cargarEspeciePublicada(id)
  if (!especie) notFound()
  return <FichaEspecie especie={especie} />
}
