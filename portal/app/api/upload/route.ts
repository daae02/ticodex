import { NextResponse } from "next/server"
import { requireUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseStorageBucket } from "@/lib/supabase/env"
import { FOTO_TIPO_VALUES } from "@/lib/csv/columns"

export const runtime = "nodejs"

/**
 * Sube una foto (por tipo) o un sonido a Supabase Storage y deja la fila
 * correspondiente en `especie_foto` / `especie.sonido_url`. Va por Route
 * Handler (no Server Action) para no chocar con el límite de 1MB por
 * default de las Server Actions — fotos y audio suelen pesar más que eso.
 */
export async function POST(request: Request) {
  try {
    await requireUser()
  } catch {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const formData = await request.formData()
  const especieId = String(formData.get("especieId") ?? "")
  const kind = String(formData.get("kind") ?? "")
  const tipo = String(formData.get("tipo") ?? "")
  const file = formData.get("file")

  if (!especieId || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta especieId o archivo." },
      { status: 400 }
    )
  }
  if (kind !== "foto" && kind !== "sonido") {
    return NextResponse.json({ error: "kind inválido." }, { status: 400 })
  }
  if (
    kind === "foto" &&
    !FOTO_TIPO_VALUES.includes(tipo as (typeof FOTO_TIPO_VALUES)[number])
  ) {
    return NextResponse.json(
      { error: "tipo de foto inválido." },
      { status: 400 }
    )
  }

  const supabase = await createSupabaseServerClient()
  const bucket = supabaseStorageBucket()

  const extension = file.name.split(".").pop() || "bin"
  const carpeta = kind === "foto" ? tipo : "sonido"
  const nombreArchivo = `${especieId}/${carpeta}/${Date.now()}.${extension}`

  const { error: errorSubida } = await supabase.storage
    .from(bucket)
    .upload(nombreArchivo, file, {
      contentType: file.type || undefined,
      upsert: false,
    })

  if (errorSubida) {
    const bucketFalta = /bucket.*not.*found/i.test(errorSubida.message)
    return NextResponse.json(
      {
        error: bucketFalta
          ? `El bucket de Storage "${bucket}" todavía no existe en Supabase — hace falta que backend-supabase lo cree (ver resumen del agente portal-web).`
          : `No se pudo subir el archivo: ${errorSubida.message}`,
      },
      { status: 500 }
    )
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(nombreArchivo)

  if (kind === "sonido") {
    const { error } = await supabase
      .from("especie")
      .update({ sonido_url: publicUrl })
      .eq("id", especieId)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ url: publicUrl })
  }

  // foto: como especie_foto.tipo no es intercambiable, esta UI mantiene como
  // máximo una foto por tipo — subir una nueva reemplaza la anterior de ese
  // tipo en vez de apilarlas (simplificación de alcance, ver resumen).
  await supabase
    .from("especie_foto")
    .delete()
    .eq("especie_id", especieId)
    .eq("tipo", tipo as (typeof FOTO_TIPO_VALUES)[number])

  const { error: errorInsert } = await supabase.from("especie_foto").insert({
    especie_id: especieId,
    tipo: tipo as (typeof FOTO_TIPO_VALUES)[number],
    url: publicUrl,
    es_principal: tipo === "adulto",
    orden: 0,
  })

  if (errorInsert) {
    return NextResponse.json({ error: errorInsert.message }, { status: 500 })
  }

  return NextResponse.json({ url: publicUrl })
}
