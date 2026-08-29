import { createSupabaseServerClient } from "@/lib/supabase/server"
import { CatalogoGrid, type EspecieGrid } from "@/components/publico/CatalogoGrid"

// Lee cookies (Supabase) → renderizado dinámico. El contenido cambia en
// cuanto el equipo interno publica una especie nueva, así que no se cachea.
export const dynamic = "force-dynamic"

async function cargarPublicadas(): Promise<EspecieGrid[]> {
  const supabase = await createSupabaseServerClient()
  // La RLS de Fase 1 ya limita la lectura anónima a `estado_publicacion =
  // 'publicado'`; el filtro explícito lo deja documentado y a prueba de
  // cambios de política.
  const { data, error } = await supabase
    .from("especie")
    .select(
      "id, nombre_comun_es, nombre_comun_en, nombre_cientifico, estado_conservacion, especie_foto(url, tipo, es_principal, orden)"
    )
    .eq("estado_publicacion", "publicado")
    .order("nombre_comun_es", { ascending: true })

  if (error) throw error
  return data ?? []
}

export default async function CatalogoPublicoPage() {
  const especies = await cargarPublicadas()
  return <CatalogoGrid especies={especies} />
}
