"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export interface EstadoRestablecer {
  error?: string
}

export async function actualizarContrasenaAction(
  _prevState: EstadoRestablecer,
  formData: FormData
): Promise<EstadoRestablecer> {
  const password = String(formData.get("password") ?? "")
  const confirmar = String(formData.get("confirmar") ?? "")

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." }
  }
  if (password !== confirmar) {
    return { error: "Las contraseñas no coinciden." }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return {
      error: "No se pudo actualizar la contraseña. Pedí un enlace nuevo.",
    }
  }

  redirect("/especies")
}
