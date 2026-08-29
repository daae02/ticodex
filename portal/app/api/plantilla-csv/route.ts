import { NextResponse } from "next/server"
import { requireUser } from "@/lib/supabase/server"
import { readTemplateCsv } from "@/lib/csv/templateFile"

export const runtime = "nodejs"

// Sirve el MISMO archivo que usa internamente el scraper (regla explícita
// del dispatch) — no una copia. Ver lib/csv/templateFile.ts.
export async function GET() {
  try {
    await requireUser()
  } catch {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const contenido = await readTemplateCsv()

  return new NextResponse(contenido, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="template_especies.csv"',
    },
  })
}
