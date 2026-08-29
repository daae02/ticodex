"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "./server"

export async function cerrarSesionAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
