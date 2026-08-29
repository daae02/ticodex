import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { EspecieForm } from "../../EspecieForm"

export const metadata = { title: "Editar especie — Ticodex Panel" }

export default async function EditarEspeciePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ creada?: string }>
}) {
  const { id } = await params
  const { creada } = await searchParams

  const supabase = await createSupabaseServerClient()
  const { data: especie, error } = await supabase
    .from("especie")
    .select("*, especie_foto(*)")
    .eq("id", id)
    .single()

  if (error || !especie) {
    notFound()
  }

  return (
    <div className="stack">
      <h1 className="pixel" style={{ fontSize: 16 }}>
        EDITAR ESPECIE
      </h1>
      {creada === "1" && (
        <p className="ok">
          Especie creada como borrador. Cargá fotos y sonido acá abajo.
        </p>
      )}
      <EspecieForm especie={especie} />
    </div>
  )
}
