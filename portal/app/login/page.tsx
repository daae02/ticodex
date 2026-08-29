import { LoginForm } from "./LoginForm"

export const metadata = { title: "Ingresar — Ticodex Panel" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

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
        <h1 className="pixel" style={{ fontSize: 16 }}>
          TICODEX PANEL
        </h1>
        <LoginForm redirectTo={redirectTo ?? "/especies"} />
      </div>
    </div>
  )
}
