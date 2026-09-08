import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { RestablecerForm } from "./RestablecerForm"

export const metadata = { title: "Restablecer contraseña — Ticodex Panel" }

export default async function RestablecerPage() {
  // Solo llega acá con una sesión de recuperación (canjeada en
  // /auth/confirm a partir del enlace del correo). Sin sesión, no hay nada
  // que restablecer.
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--white)",
      }}
    >
      <div
        className="tarjeta"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <h1 className="pixel" style={{ fontSize: 16, textAlign: "center" }}>
          NUEVA CONTRASEÑA
        </h1>
        <RestablecerForm />
      </div>
    </div>
  )
}
